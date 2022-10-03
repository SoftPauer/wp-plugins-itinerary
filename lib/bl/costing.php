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
  global $wpdb, $table_name_costings, $vtable_name_section_values;
  
}
/**
 * adds a new costing
 */

function create_new_costing(WP_REST_Request $request)
{
  global $wpdb, $table_name_costings;
  $body = json_decode($request->get_body());
  $results = get_costing_value($body->id);
  $sameListType = $wpdb->get_results("SELECT * FROM {$table_name_costings} WHERE listKey = '{$body->listKey}'");
  if ( count($results) > 0) {
    $originalEntry = $wpdb->get_results("SELECT costing FROM {$table_name_costings} WHERE id = '{$results[0]->id}'");
    $originalPrice = json_decode($originalEntry[0]->costing);

    $sql = "UPDATE {$table_name_costings} SET costing = %s  WHERE id = '{$results[0]->id}'";
    $sql = $wpdb->prepare($sql,  json_encode($body->costing));
    $wpdb->query($sql);
    if ($originalPrice->units->Price != $body->costing->units->Price){
      create_costing_stringPrice($sameListType,$body->costing->units->Price,$body->costing->units->FareType);   
    }else if ($originalPrice->units->FareType != $body->costing->units->FareType){
      create_costing_stringFareType($sameListType,$body,$body->costing->units->FareType);
    }
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
    $newEntry = get_costing_value($id);
    $newEntryElement = $newEntry[0];
    $newEntryCosting = json_decode($newEntryElement->costing);
    $newEntryElement->costing = $newEntryCosting;
    create_costing_stringFareType($sameListType,$newEntryElement,$newEntryElement->costing->units->FareType);
    return get_costing_value($id);
  }
}

function create_costing_stringFareType($sameListType,$body,$newFareType){
  global $wpdb, $table_name_costings;
  $loop = FALSE;
  $found = FALSE;
  $id = ($body->id);
  while ($loop == FALSE){
    foreach($sameListType as $result){
      $costingInfo = json_decode($result->costing);
      if ($costingInfo->units->FareType == $newFareType && $id != $result ->id && $found == FALSE){
        $body->costing->units->Price = $costingInfo->units->Price;
        $body->costing->totalCost = $costingInfo->units->Price;
        $body = json_encode($body->costing); 
        $found = TRUE;
        $loop = TRUE;       
      }   
   }$loop = TRUE;
  }
  if ($found != TRUE){
    $body->costing->units->Price = 0;
    $body->costing->totalCost = 0;
    $body = json_encode($body->costing); 
  }
  $sql = "UPDATE {$table_name_costings} SET costing = '$body' WHERE id = '$id'";
  $sql = $wpdb->prepare($sql);
  $wpdb->query($sql);
}

function create_costing_stringPrice($sameListType,$updatePrice,$faretype){ 
  
  global $wpdb, $table_name_costings;
  foreach($sameListType as $result){
    $costingInfo = json_decode($result->costing);
    if ($costingInfo->units->FareType == $faretype){
      $costingInfo->units->Price = ($updatePrice);
      $costingInfo->totalCost = ($updatePrice);
      $costingInfo = json_encode($costingInfo);
      $sql = "UPDATE {$table_name_costings} SET costing = '$costingInfo' WHERE id = '$result->id'";
      $sql = $wpdb->prepare($sql);
      $wpdb->query($sql);
    };      
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
  global $wpdb, $table_name_costings;

  $itin = $data["itinerary_id"];
  $name = $data["name"];
  $key = $data["list_key"];

  $costs = $wpdb->get_results("SELECT * FROM {$table_name_costings} WHERE itinerary_id = '$itin' AND listKey = '$key' ", OBJECT);
  
  foreach( $costs as $cost){
    $costing = $cost->costing;
    $costing = json_decode($costing);
    $units = $costing->units;
    $passenger = $units->Passenger;
    if($passenger == $name){
      
      $wpdb->delete(
      $table_name_costings,
      ['id' => $cost->id],
      ['%d'],
  );
    }
    
  }
  }