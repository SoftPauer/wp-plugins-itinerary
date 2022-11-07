<?php

/**
 * Return all sections
 */
function get_all_sections()
{
  global $wpdb;
  $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}itinerary_sections", OBJECT);

  return rest_ensure_response($results);
}

/**
 * CREATE or UPDATE section
 */
function create_new_section(WP_REST_Request $request)
{
  global $wpdb, $table_name_sections;
  $body = json_decode($request->get_body());

  // Validate body 

  if (!property_exists($body, "name")) {
    return new WP_Error('400', esc_html__('Missing body parameter name', 'text_domain'), array('status' => 400));
  }
  if (property_exists($body, "id")) {
    $results = get_section_by_id($body->id);
    if ($results && count($results) > 0) {
      $sql = "UPDATE {$table_name_sections} SET properties = %s , name = %s WHERE id = '{$results[0]->id}'";
      $sql = $wpdb->prepare($sql, json_encode($body->properties), $body->name);
      $data = ['updated' => $wpdb->query($sql)];
      return json_encode($data);
    } else {
      return new WP_Error('404', esc_html__("Section with id {$body->id}  not found", 'text_domain'), array('status' => 404));
    }
  } else {
    return $wpdb->insert(
      $table_name_sections,
      array(
        'time_created' => current_time('mysql'),
        'time_updated' => current_time('mysql'),
        'name' => $body->name,
        'properties' => json_encode($body->properties),
      ),
      array(
        '%s',
        '%s',
        '%s',
        '%s',
      )
    );
  }
}
/**
 * DELETE section 
 */
function delete_section($data)
{
  global $wpdb, $table_name_sections, $table_name_section_values, $table_name_fields;
  $wpdb->delete(
    $table_name_fields,
    ['section' => $data['section_id']],
    ['%d'],
  );
  $wpdb->delete(
    $table_name_costings,
    ['section_id' => $data['section_id']],
    ['%d'],
  );
  $wpdb->delete(
    $table_name_section_values,
    ['section' => $data['section_id']],
    ['%d'],
  );
  return $wpdb->delete(
    $table_name_sections,
    ['id' => $data['section_id']],
    ['%d'],
  );
}


function get_section_by_id($section_Id)
{
  global $wpdb, $table_name_sections;
  $results = $wpdb->get_results(
    "SELECT * FROM {$table_name_sections} 
     WHERE id = '{$section_Id}'",
    OBJECT
  );
  return $results;
}
