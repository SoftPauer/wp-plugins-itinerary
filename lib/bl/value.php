<?php

/**
 * Get race map data from the db
 */

function get_race_map()
{
  global $wpdb;
  $raceMap = array();
  $raceData = $wpdb->get_results("select t.* from wp_itinerary_data t where t.time_updated = (select max(t1.time_updated) from wp_itinerary_data t1 where t1.itinerary_id = t.itinerary_id);");

  foreach ($raceData as $race) {
    $jsonData = json_decode(trim($race->json_data, '"'));
    // we need to find "event_information" in v2 if its found we will use it as replacement 
    //for general_info as it is a default required section 

    $event_information = null;
    foreach ($jsonData->v2 as $obj) {
      if ("event_information" == $obj->sectionName) {
        $event_information = $obj;
        break;
      }
    }

    if ($event_information != null) {
      $start_time = strtotime($event_information->data->Start_Date);
      $end_time = strtotime($event_information->data->End_Date);
      $race_name = $event_information->data->Event_Type;

    } else {
      // fallback to general info
      $start_time = strtotime($jsonData->general_info->startDate);
      $end_time = strtotime($jsonData->general_info->endDate);
      $race_name = $jsonData->general_info->raceName;
    }
    $id = $race->itinerary_id;
    $race_endpoint = '/wp-json/itinerary/v1/data/' . $race->id;

    $race_item = array(
      "end_time" => $end_time,
      "id" => $id,
      "race_endpoint" => $race_endpoint,
      "race_name" => $race_name,
      "start_time" => $start_time,
      "last_updated" => strtotime($race->time_updated),
      "race_id" => $race->id
    );
    array_push($raceMap, $race_item);
  }

  return ($raceMap);
}

//does the same as updateApp but all on the backend 
function update_value(WP_REST_Request $request)
{
  $id = $request['itin_id'];
  return update_app($id);
}

//this is the version using the json keys, make it the main version when nissan is over 
function update_value_test(WP_REST_Request $request)
{
  global $wpdb, $table_name_itinerary_data;
  $wpdb->show_errors();
  $id = $request['itin_id'];
  $json = (object) array("v2" => []);
  //$results = $wpdb->get_results("SELECT section, value FROM {$wpdb->prefix}itinerary_values where itinerary = {$id}", OBJECT); //use json key - not name. 
  $sections = $wpdb->get_results("SELECT id, name, properties FROM {$wpdb->prefix}itinerary_sections", OBJECT);
  foreach ($sections as $x => $v) {
    //$name = strtolower(str_replace(" ", "_", $v->name));
    $jsonName = json_decode($v->properties)->jsonName;
    $result = $wpdb->get_results("SELECT value FROM {$wpdb->prefix}itinerary_values where section = {intval($v->id)} and itinerary = {$id}", OBJECT);
    $json->$jsonName = json_decode($result[0]->value);
  }
  $users = [];
  $user_result = $wpdb->get_results("SELECT id, user_login, user_email  FROM {$wpdb->prefix}users", OBJECT);
  foreach ($user_result as $x => $v) {
    $firstName = $wpdb->get_results("SELECT meta_value FROM {$wpdb->prefix}usermeta where user_id = {intval($v->id)} and meta_key = 'first_name'", OBJECT);
    $surname = $wpdb->get_results("SELECT meta_value FROM {$wpdb->prefix}usermeta where user_id = {intval($v->id)} and meta_key ='last_name'", OBJECT);
    $department = $wpdb->get_results("SELECT meta_value FROM {$wpdb->prefix}usermeta where user_id = {intval($v->id)} and meta_key = 'department'", OBJECT);
    $users[] = (object) array("id" => $v->id, "firstName" => $firstName[0]->meta_value, "surname" => $surname[0]->meta_value, "department" => $department[0]->meta_value, "email" => $v->user_email, "userName" => $v->user_login);
  }
  $json->users = $users;
  $format = '%Y-%m-%dT%H:%M:%S.%VZ';
  $strf = strftime($format);
  $json->updatedAt = $strf;
  $encoded = json_encode(json_encode($json));
  $strf = substr(str_replace("T", " ", $strf), 0, 19);
  $outcome = $wpdb->get_results(" INSERT INTO {$wpdb->prefix}itinerary_data (itinerary_id, time_updated, json_data) VALUES ($id, '$strf', $encoded) ");
  return ($outcome);
  //return([$id, $strf, $json, $sections, $jsonName]);
}

function get_itin_data(WP_REST_Request $request)
{
  global $wpdb, $table_name_itinerary_data;
  $id = $request['itin_id'];
  $result = $wpdb->get_results("SELECT * FROM $table_name_itinerary_data WHERE id = $id");
  return (json_decode(trim($result[0]->json_data, '"')));
}


/**
 * Creates new entry into the final values table of the db to read from react-dashboard
 */
//NOT used anymore?
function update_entry_in_db(WP_REST_Request $request)
{
  global $wpdb, $table_name_itinerary_data;
  $params = $request->get_json_params();
  $itinerary_id = $params['itinId'];
  $json_data = json_encode($params['json_data']);
  $time_updated = $params['time_updated'];
  $results = $wpdb->get_results(" INSERT INTO $table_name_itinerary_data (itinerary_id, time_updated, json_data) VALUES ($itinerary_id, $time_updated, '$json_data') ");
  return rest_ensure_response($results);
}


/**
 * Return all field values for the section
 */
function get_all_section_values($data)
{
  if ($data['section_id'] != 0) {
    $results = get_section_value($data['section_id'], $data['itinerary_id']);
    if (empty($results)) {
      return rest_ensure_response(null);
    }
    return rest_ensure_response($results[0]);
  }
  return rest_ensure_response(get_itinerary_values($data['itinerary_id']));
}

/**
 * Create entire section value 
 */
function create_new_section_value(WP_REST_Request $request)
{
  $body = json_decode($request->get_body());

  if (!key_exists("section", $body)) {
    return new WP_Error('400', esc_html__('Missing body parameter section', 'text_domain'), array('status' => 400));
  }
  if (!key_exists("itinerary", $body)) {
    return new WP_Error('400', esc_html__('Missing body parameter itinerary', 'text_domain'), array('status' => 400));
  }

  if (key_exists("value", $body)) {
    $res = create_update_value($body);
  }

  return $res;
}



/**
 * DELETE value 
 */
function delete_value($data)
{
  global $wpdb, $table_name_section_values;

  $sql = $wpdb->prepare(
    "DELETE FROM $table_name_section_values
           WHERE id = $data[value_id]",
  );
  return $wpdb->query($sql);
}

function copy_all_values_from_selected_itinerary(WP_REST_Request $request)
{
  global $wpdb, $table_name_itinerary, $table_name_section_values, $table_name_sections, $table_name_costings;


  // Get new itinerary
  $sql = "SELECT * FROM {$table_name_itinerary} where id = (select max(id) from wp_itineraries);";
  $copyItin = $wpdb->get_row($sql);


  //get itinerary to copy
  $prevItin = $request['itin_id'];
  $sections = $wpdb->get_results("SELECT * FROM {$table_name_sections}", OBJECT);


  foreach ($sections as $section) {

    // get previous values
    $prevRes = $wpdb->get_results(
      "SELECT * FROM {$table_name_section_values} 
      WHERE  itinerary = {$prevItin} AND section = {$section->id}",
    OBJECT
    );

    //insert prev values into new itin
    if ($prevRes[0]->value) {
      $sql = "INSERT INTO 
    {$table_name_section_values} (section,itinerary,value) 
     VALUES ({$section->id}, $copyItin->id,'{$prevRes[0]->value}')";
      $sql = $wpdb->prepare($sql);
      $wpdb->query($sql);
    }
  }

  $costings = $wpdb->get_results("SELECT * FROM {$table_name_costings} WHERE itinerary_id = {$prevItin} ", OBJECT);

  foreach ($costings as $costing) {
    $sql = "INSERT INTO 
    {$table_name_costings} (itinerary_id,section_id,listkey,costing) 
     VALUES ($copyItin->id, $costing->section_id, '{$costing->listKey}','{$costing->costing}')";
    $sql = $wpdb->prepare($sql);
    $wpdb->query($sql);
  }
}


function copy_values_from_last_itin(WP_REST_Request $request)
{
  global $wpdb, $table_name_itinerary, $table_name_section_values;
  $currentItin = $request['itin_id'];

  // Get last itinerary
  $sql = "SELECT * FROM {$table_name_itinerary} where id = (select max(id) from wp_itineraries where id < {$currentItin});";
  $itin = $wpdb->get_row($sql);
  $prevItin = $itin->id;
  if ($prevItin == null) {
    return new WP_Error('400', esc_html__('No previous itinerary found ', 'text_domain'), array('status' => 400));
  }

  // check if body is valid
  $body = json_decode($request->get_body());

  if (!property_exists($body, "section")) {

    return new WP_Error('400', esc_html__('Missing body parameter section', 'text_domain'), array('status' => 400));
  }
  // Delete all values for the section
  $wpdb->query("DELETE from {$table_name_section_values} where itinerary = {$currentItin} and section = {$body->section}");

  // get previous values
  $prevRes = $wpdb->get_results(
    "SELECT * FROM {$table_name_section_values} 
     WHERE  itinerary = {$prevItin} AND section = {$body->section}",
  OBJECT
  );

  $sql = "INSERT INTO 
    {$table_name_section_values} (section,itinerary,value) 
     VALUES ({$body->section}, $currentItin,'{$prevRes[0]->value}')";
  $sql = $wpdb->prepare($sql);
  return $wpdb->query($sql);
}

function get_section_value($section_id, $itinerary_id)
{
  global $wpdb, $table_name_section_values;
  $results = $wpdb->get_results(
    "SELECT * FROM {$table_name_section_values} 
     WHERE section = {$section_id} 
     AND itinerary = {$itinerary_id} ",
  OBJECT
  );
  return $results;
}

function get_itinerary_values($itinerary_id)
{
  global $wpdb, $table_name_section_values;
  $results = $wpdb->get_results(
    "SELECT * FROM {$table_name_section_values} 
    WHERE itinerary = {$itinerary_id} ",
  OBJECT
  );
  return $results;
}