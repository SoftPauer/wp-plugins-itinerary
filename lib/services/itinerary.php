<?php

/**
 * Create itinerary 
 */
function create_itinerary(string $name)
{
  global $wpdb, $table_name_itinerary;
  return $wpdb->insert(
    $table_name_itinerary,
    array(
      'time_created' => current_time('mysql'),
      'time_updated' => current_time('mysql'),
      'name' => $name,
    ),
    array(
      '%s',
      '%s',
      '%s',
    )
  );
}

function find_itinerary(string $name)
{
  global $wpdb, $table_name_itinerary;
  return $wpdb->get_row($wpdb->prepare("SELECT * FROM $table_name_itinerary WHERE name = %s", $name));
}