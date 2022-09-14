<?php

/**
 * Create itinerary 
 */
function create_new_itinerary(WP_REST_Request $request)
{
  global $wpdb, $table_name_itinerary;
  $body = json_decode($request->get_body());
  //Validate body 
  if (!property_exists($body, "name")) {
    return new WP_Error('400', esc_html__('Missing body parameter name', 'text_domain'), array('status' => 400));
  }
  return $wpdb->insert(
    $table_name_itinerary,
    array(
      'time_created' => current_time('mysql'),
      'time_updated' => current_time('mysql'),
      'name' => $body->name,
    ),
    array(
      '%s',
      '%s',
      '%s',
    )
  );
}

/**
 * DELETE itinerary 
 */
function delete_itinerary($data)
{
  global $wpdb, $table_name_itinerary, $table_name_section_values,  $table_name_itinerary_data, $table_name_costings;

  $wpdb->delete(
    $table_name_itinerary_data,
    ['itinerary_id' => $data['itinerary_id']],
    ['%d'],
  );

  $wpdb->delete(
    $table_name_costings,
    ['itinerary_id' => $data['itinerary_id']],
    ['%d'],
  );

  $wpdb->delete(
    $table_name_section_values,
    ['itinerary' => $data['itinerary_id']],
    ['%d'],
  );
  return $wpdb->delete(
    $table_name_itinerary,
    ['id' => $data['itinerary_id']],
    ['%d'],
  );
}

/**
 * Return all itineraries
 */
function get_all_itineraries()
{
  global $wpdb;
  $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}itineraries", OBJECT);
  return rest_ensure_response($results);
}
