<?php

function create_update_value($value)
{
  global $wpdb, $table_name_section_values;
  $results = get_section_value($value->section, $value->itinerary);
  $val = json_encode($value->value);
  if ($results && count($results) > 0) {
    $sql = "UPDATE {$table_name_section_values} SET value = %s  WHERE id = '{$results[0]->id}'";
    $sql = $wpdb->prepare($sql, $val);
    $data = ['updated' => $wpdb->query($sql)];
    update_reporting($val, $results[0]->id, $value->section, $value->itinerary);
    return json_encode($data);
  } else {
    $sql = "INSERT INTO 
    {$table_name_section_values} (section,itinerary,value) 
     VALUES ($value->section, $value->itinerary, '$val')";
    $wpdb->query($sql);
    return $wpdb->get_row("SELECT * FROM $table_name_section_values WHERE id = $wpdb->insert_id");
  }
}

function update_app($id)
{
  global $wpdb, $table_name_sections, $table_name_section_values, $table_name_itinerary_data;

  $wpdb->show_errors();
  $json = (object) array("v2" => []);
  $sections = $wpdb->get_results("SELECT id, name, properties  FROM $table_name_sections", OBJECT);
  foreach ($sections as $v) {
    $name = strtolower(str_replace(" ", "_", $v->name));
    $result = $wpdb->get_results("SELECT value FROM $table_name_section_values where section = {intval($v->id)} and itinerary = $id", OBJECT);
    $props = json_decode($v->properties);
    if (!isset($props->version)) {
      $version = 1;
    } else {
      $version = $props->version;
    }
    if ($version == 2) {
      if (isset($result[0])) {
        $v2Section = array(
          "sectionName" => $name,
          "sectionDisplayName" => $props->sectionDisplayName,
          "sectionDisplayNameTeams" =>
          $props->sectionDisplayNameTeams ??
          $props->sectionDisplayName,
          "renderer" => $props->renderer,
          "rendererOptions" => $props->rendererOptions,
          "data" => json_decode($result[0]->value)
        );
        array_push($json->v2, $v2Section);
      }
    } else {
      if (isset($result[0])) {
        $json->$name = json_decode($result[0]->value);
      }
    }
  }
  $users = [];
  $user_result = $wpdb->get_results("SELECT id, user_login, user_email  FROM {$wpdb->prefix}users", OBJECT);
  foreach ($user_result as $v) {
    $meta = get_user_meta($v->id);
    $firstName = $meta["first_name"][0];
    $surname = $meta["last_name"][0];
    $department = $meta["department"][0];
    $users[] = (object) array("id" => $v->id, "firstName" => $firstName, "surname" => $surname, "department" => $department, "email" => $v->user_email, "userName" => $v->user_login);
  }
  $json->users = $users;
  $format = '%Y-%m-%dT%H:%M:%S.%VZ';
  $strf = strftime($format);
  $json->updatedAt = $strf;
  $encoded = json_encode(json_encode($json));
  $strf = substr(str_replace("T", " ", $strf), 0, 19);
  $outcome = $wpdb->get_results(" INSERT INTO $table_name_itinerary_data (itinerary_id, time_updated, json_data) VALUES ($id, '$strf', $encoded) ");
  return ($outcome);
}