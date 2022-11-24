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
    $jsonData = json_decode( trim($race->json_data, '"'));
    $start_time = strtotime($jsonData->general_info->startDate);
    $end_time = strtotime($jsonData->general_info->endDate);
    $id = $race->itinerary_id;
    $race_name = $jsonData->general_info->raceName;
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

function get_itin_data(WP_REST_Request $request)
{
  global $wpdb, $table_name_itinerary_data;
  $id = $request['itin_id'];
  $result = $wpdb->get_results("SELECT * FROM $table_name_itinerary_data WHERE id = $id");
  return (json_decode( trim($result[0]->json_data,'"')));
}


/**
 * Creates new entry into the final values table of the db to read from react-dashboard
 */

function update_entry_in_db(WP_REST_Request $request)
{
  global $wpdb, $table_name_itinerary_data;
  $params = $request->get_json_params();
  $itinerary_id = $params['itinId'];
  $json_data = json_encode( $params['json_data']);
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
 * Create field value
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

function create_update_value($value)
{
  global $wpdb, $table_name_section_values;
  $results = get_section_value($value->section, $value->itinerary);
  $val = json_encode($value->value);
  if ($results && count($results) > 0) {
    $sql = "UPDATE {$table_name_section_values} SET value = %s  WHERE id = '{$results[0]->id}'";
    $sql = $wpdb->prepare($sql,  $val);
    $data = ['updated' => $wpdb->query($sql)];
    update_reporting($val, $results[0]->id, $value->section, $value->itinerary);
    return json_encode($data);
  } else {
    $sql = "INSERT INTO 
    {$table_name_section_values} (section,itinerary,value) 
     VALUES ($value->section, $value->itinerary, '$val')";
    $wpdb->query($sql);
    return  $wpdb->get_row("SELECT * FROM $table_name_section_values WHERE id = $wpdb->insert_id");
  }
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

function copy_all_values_from_selected_itinerary(WP_REST_Request $request){
  global $wpdb, $table_name_itinerary, $table_name_section_values,$table_name_sections,$table_name_costings;

  
  // Get new itinerary
  $sql = "SELECT * FROM {$table_name_itinerary} where id = (select max(id) from wp_itineraries);";
  $copyItin = $wpdb->get_row($sql);
  

  //get itinerary to copy
  $prevItin = $request['itin_id'];
  $sections = $wpdb->get_results("SELECT * FROM {$table_name_sections}", OBJECT);
  

  foreach($sections as $section){
    
    // get previous values
    $prevRes = $wpdb->get_results(
      "SELECT * FROM {$table_name_section_values} 
      WHERE  itinerary = {$prevItin} AND section = {$section->id}",
      OBJECT
    );
    error_log('previous values: '. json_encode($prevRes[0]->value));

    //insert prev values into new itin
    if($prevRes[0]->value){
      $sql = "INSERT INTO 
    {$table_name_section_values} (section,itinerary,value) 
     VALUES ({$section->id}, $copyItin->id,'{$prevRes[0]->value}')";
    $sql = $wpdb->prepare($sql);
    $wpdb->query($sql);
    }
    
  }

  $costings = $wpdb->get_results("SELECT * FROM {$table_name_costings} WHERE itinerary_id = {$prevItin} ", OBJECT);

  foreach($costings as $costing){
    $sql = "INSERT INTO 
    {$table_name_costings} (itinerary_id,section_id,listkey,costing) 
     VALUES ($copyItin->id, $costing->section_id, '{$costing->listKey}','{$costing->costing}')";
     error_log('sql: '. json_encode($sql));
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

function get_itinerary_values($itinerary_id){
  global $wpdb, $table_name_section_values;
  $results = $wpdb->get_results(
    "SELECT * FROM {$table_name_section_values} 
    WHERE itinerary = {$itinerary_id} ",
    OBJECT
  );
  error_log(json_encode($result));
  return $results;
}