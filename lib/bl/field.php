<?php

/**
 * Return all fields for the section
 */
function get_all_fields($data)
{
  global $wpdb, $table_name_fields;
  if ($data["section_id"] != 0) {
    $results = $wpdb->get_results("SELECT * FROM {$table_name_fields} WHERE section = {$data['section_id']}", OBJECT);
  } else {
    $results = $wpdb->get_results("SELECT * FROM {$table_name_fields}", OBJECT);
  }
  return rest_ensure_response($results);
}

/**
 * Create field
 */
function create_new_field(WP_REST_Request $request)
{
  global $wpdb, $table_name_fields;
  $body = json_decode($request->get_body());

  // Validate body 
  if (!property_exists($body, "section")) {
    return new WP_Error('400', esc_html__('Missing body parameter section', 'text_domain'), array('status' => 400));
  }
  if (!property_exists($body, "position")) {
    return new WP_Error('400', esc_html__('Missing body parameter position', 'text_domain'), array('status' => 400));
  }
  if (!property_exists($body, "type")) {
    return new WP_Error('400', esc_html__('Missing body parameter type', 'text_domain'), array('status' => 400));
  }
  if (!property_exists($body, "name")) {
    return new WP_Error('400', esc_html__('Missing body parameter name', 'text_domain'), array('status' => 400));
  }
  if (!property_exists($body, "parent")) {
  }

  $props = json_encode($body->type_properties);
  $parent = !empty($body->parent) ? "$body->parent" : "NULL";
  $sql = "INSERT INTO {$table_name_fields}
    (id,section,position,field_type,field_name,parent,type_properties) 
    VALUES (%d,%d,%d,%s,%s,{$parent},'{$props}') ON DUPLICATE KEY UPDATE 
    section = '{$body->section}',
    position = '{$body->position}',
    field_type = '{$body->type}',
    field_name = '{$body->name}',
    parent = {$parent},
    type_properties = '{$props}'";
  $sql = $wpdb->prepare($sql, $body->id, $body->section, $body->position, $body->type, $body->name);
  return $wpdb->query($sql);
}

/**
 * DELETE field 
 */
function itin_delete_field($data)
{
  global $wpdb, $table_name_fields;
  return $wpdb->delete(
    $table_name_fields,
    ['id' => $data['field_id']],
    ['%d'],
  );
}
