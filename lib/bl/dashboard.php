<?php

function get_dashboard_fields()
{
  global $wpdb;
  $currentFieldQuery = $wpdb->get_results("SELECT * FROM `wp_options` WHERE `option_name` = 'dashboardFields'");
  if ($currentFieldQuery == NULL) {
    return array();
  } else {
    $currentFields = unserialize($currentFieldQuery[0]->option_value);
    return $currentFields;
  }
}

function add_dashboard_field(WP_REST_Request $request)
{
  global $wpdb;
  $fieldId = $request['field_id'];
  $currentFieldsQuery = $wpdb->get_results("SELECT * FROM `wp_options` WHERE `option_name` = 'dashboardFields'");
  if ($currentFieldsQuery == NULL) {
    $fields = array($fieldId);
    $result = $wpdb->insert('wp_options', array('option_name' => 'dashboardFields', 'option_value' => serialize($fields)));
    return new WP_REST_Response(array('success' => true), 200);
  } else {
    $currentFields = unserialize($currentFieldsQuery[0]->option_value);
    if (in_array($fieldId, $currentFields)) {
      return new WP_REST_Response(array('success' => false, 'message' => 'Field already exists'), 201);
    } else {
      array_push($currentFields, $fieldId);
      $result = $wpdb->get_results("UPDATE `wp_options` SET `option_value` = '" . serialize($currentFields) . "' WHERE `option_name` = 'dashboardFields'");
    }
  }
  return rest_ensure_response($result);
}


function find_root_section($field)
{
  global $wpdb, $table_name_fields;
  if ($field->parent == NULL) {
    return $field;
  } else {
    $parent = $wpdb->get_results("SELECT * FROM $table_name_fields WHERE id = $field->parent");
    return find_root_section($parent[0]);
  }
}

function get_root_key($field)
{
  $root_node = find_root_section($field);
  $root_type_props = json_decode($root_node->type_properties, true);

  if ($root_type_props == NULL || $root_type_props['json_key'] == "") {
    return str_replace(' ', '_', $root_node->field_name);
  } else {
    return $root_type_props["json_key"];
  }
}

function generate_reporting_table(WP_REST_Request $request)
{
  global $wpdb, $table_name_reporting, $table_name_fields, $table_name_section_values;
  //delete table entries 
  $wpdb->query("DELETE FROM $table_name_reporting");

  $itineraryId = $request['itinerary_id'];


  //get all fields with reporting enabled
  $sql = 'SELECT * FROM ' . $table_name_fields . ' WHERE type_properties LIKE ' . "'" . '%"showOnDashboard":true%' . "'";
  
  // $fields_with_reporting = $wpdb->get_results("SELECT * FROM " . $table_name_fields . ` WHERE type_properties LIKE '%"showOnDashboard":true%';`);
  $fields_with_reporting = $wpdb->get_results($sql);
    
    $tableDict = array();
    foreach ($fields_with_reporting as $field) {
      $root_key = get_root_key($field);
      [$parent_field, $parent_json_key, $field_json_key] = get_field_parent($field, $field->section);
      $data = $wpdb->get_results("SELECT value FROM " . $table_name_section_values . " WHERE itinerary = " . $itineraryId . " AND section =" . $field->section);
      $values = json_decode($data[0]->value);
      
      // $values = $values->$root_key;
      foreach ($values as $value) {
        foreach ($value as $section_value) {
          if ($parent_json_key != "" && isset($section_value->$parent_json_key)) {
            $passenger_value = $section_value->$parent_json_key;
            //passenger values in this case are stored in arrays

            // error_log("passenger: " . print_r($passenger_value, true));
            // error_log(print_r($section_value, true));
            foreach ($passenger_value as $passenger) {
              
              if (is_object($passenger)) {

                $passenger_data = $passenger->{$field_json_key};
                if (is_array($passenger_data)) {
                  foreach ($passenger_data as $passenger_value) {
                    add_to_array($tableDict, $passenger_value, $section_value, $root_key);
                  }
                } else {
                  $passenger_data = strval($passenger_data);
                  add_to_array($tableDict, $passenger_data, $section_value, $root_key);
                }
              }
            }
          } else {
            //passenger values in this case are stored in objects
            $passenger_value = $section_value->$field_json_key;
            
            if (is_array($passenger_value)) {
              
              foreach ($passenger_value as $passenger) {
                add_to_array($tableDict, $passenger, $section_value, $root_key);
              }
            } else {
              add_to_array($tableDict, $passenger_value, $section_value, $root_key);
            }
          }
        }
      }
    }

  return rest_ensure_response(($tableDict));
}

function add_to_array(array &$tableDict, $passenger_data, $section_value, $root_key)
{
  if (!isset($tableDict[$passenger_data])) {
    $tableDict[$passenger_data] = array();
  }
  $user_obj = &$tableDict[$passenger_data];
  if (!isset($user_obj[$root_key])) {
    $user_obj[$root_key] = array();
  }
  array_push($user_obj[$root_key], $section_value);
  // array_push($user_entry[$root_key], $section_value);
  //error_log(json_encode($user_obj));
  $tableDict[$passenger_data] = $user_obj;
}

function get_field_parent($field, $section_id)
{
  global $wpdb, $table_name_fields;
  if ($field->parent != null) {
  }
  $parent_field_to_user = $wpdb->get_results("SELECT * FROM $table_name_fields WHERE id = $field->parent AND section = $section_id");
  $parent_field_to_user = $parent_field_to_user[0];
  //unpack type props for field to get json_key 
  $user_field_type_props = json_decode($field->type_properties, true);
  $user_field_json_key = $user_field_type_props['json_key'];
  $parent_field_type_props = json_decode($parent_field_to_user->type_properties, true);
  $parent_field_json_key = $parent_field_type_props['json_key'];

  return [$parent_field_to_user, $parent_field_json_key, $user_field_json_key];
}

function get_users_from_val($val, $user_fields, $section_id, $itinerary)
{
  if (!is_array($user_fields)) {
    return array();
  }
  global $wpdb, $table_name_fields;
  $data = json_decode($val, true);
  $data_keys = array_keys($data);
  $passengers = array();
  foreach ($user_fields as $field) {
    $parent_field_to_user = $wpdb->get_results("SELECT * FROM " . $table_name_fields . " WHERE id = " . $field->parent . " AND section = " . $section_id);
    $parent_field_to_user = $parent_field_to_user[0];
    //unpack type props for field to get json_key 
    $user_field_type_props = json_decode($field->type_properties, true);
    $user_field_json_key = $user_field_type_props['json_key'];
    $parent_field_type_props = json_decode($parent_field_to_user->type_properties, true);
    $parent_field_json_key = $parent_field_type_props['json_key'];
    //check if the parent field has any json key if it doesnt then its parent node to structure
    if ($parent_field_json_key == null) {
      foreach ($data[$data_keys[0]] as $section_item) {
        if (array_key_exists($user_field_json_key, $section_item) && is_array($section_item[$user_field_json_key])) {
          $users = $section_item[$user_field_json_key];
          // function to update the current user/list in the reporting table
          foreach ($users as $user) {
            update_user_in_reporting($user, $section_item, $itinerary);
          }
        }
      }

      foreach ($data[$data_keys[0]] as $data_rows) {
        error_log("data rows: " . print_r($data_rows[$user_field_json_key], true));
        if (is_array($data_rows[$user_field_json_key])) {
          $passenger_names = $data_rows[$user_field_json_key];
          foreach ($passenger_names as $passenger_name) {
            array_push($passengers, $passenger_name);
          }
        } else {
          foreach ($data as $field) {
            if ($field[$user_field_json_key]) {
              if (count($users) == 0) {
                $users = $field[$user_field_json_key];
              }
              $users = array_merge($passengers, $field[$user_field_json_key]);
            }
          }
        }
      }
    }
  }
  error_log("use2rs: " . print_r($users, true));

  return $users;
}

function update_reporting($val, $id, $section, $itinerary)
{
  global $wpdb, $table_name_sections, $table_name_fields, $table_name_reporting;
  $sql = "SELECT * FROM " . $table_name_fields . " WHERE type_properties LIKE '%showOnDashboard%' AND section = " . $section;
  $fields_with_reporting = $wpdb->get_results($sql);
  $users = get_users_from_val($val, $fields_with_reporting, $section, $itinerary);
  error_log("users: " . print_r($users, true));
}