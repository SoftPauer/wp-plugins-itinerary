<?php

/**
* Return all costings
*/
function get_all_costings(WP_REST_Request $request){

 global $wpdb, $table_name_costings;
 $itineraryId = $request['itinerary_id'];
 $results = $wpdb->get_results("SELECT * FROM {$table_name_costings} WHERE itinerary_id = '$itineraryId'", OBJECT);

 return rest_ensure_response($results);
}

function update_costings_from_values(){
  global $wpdb, $table_name_costings, $vtable_name_section_values
  
}
/**
* adds a new costing
*/
function create_new_costing(WP_REST_Request $request)
{
 global $wpdb, $table_name_costings;
 $body = json_decode($request->get_body());
 $results = get_costing_value($body->id);
 if ( count($results) > 0) {
   $sql = "UPDATE {$table_name_costings} SET costing = %s  WHERE id = '{$results[0]->id}'";
   $sql = $wpdb->prepare($sql,  json_encode($body->costing));
   $wpdb->query($sql);
   return get_costing_value($body->id);
 } else {
   $wpdb->insert(
     $table_name_costings,
     array(
       "itinerary_id"=>$body->itinerary_id,
       "section_id"=>$body->section_id,
       "listKey"=>$body->listKey,
       "costing" => json_encode($body->costing),
     ),
     array('%d','%d',"%s",'%s')
   );
   $id = $wpdb->insert_id;
   return get_costing_value($id);
 }
}

function get_costing_value($id)
{
 global $wpdb, $table_name_costings;
 $results = $wpdb->get_results(
   "SELECT * FROM {$table_name_costings} 
    WHERE id = {$id}",
   OBJECT
 );
 return $results;
}

/**
* DELETE costing
*/
function delete_costing($data){
 
}