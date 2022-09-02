<?php
/*
Plugin Name: Itinerary plugin
Description: Plugin to control itinerary 
Author: Andrius Murauskas
Version: 1.1.0
GitHub Plugin URI: https://github.com/SoftPauer/wp-plugins-itinerary
*/


add_action('admin_menu', 'itinerary_plugin_setup_menu');

function itinerary_plugin_setup_menu()
{
  add_menu_page('Sections', 'Sections', 'manage_options', 'itinerary-plugin-sections', 'itinerary_init_sections');
  add_menu_page('Dashboard', 'Dashboard', 'manage_options', 'itinerary-plugin-dashboard', 'itinerary_init_dashboard');


  global $wpdb;
  $sections = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}itinerary_sections", OBJECT);
  foreach ($sections as &$section) {
    global $section_gl;
    $section_gl = $section;
    add_menu_page(
      'Sections-'  . $section->name,
      $section->name,
      'eventr_manager',
      'itinerary-plugin-section' . $section->name,
      function () use ($section_gl) {
        itinerary_ini_section($section_gl->name);
      }
    );
  }
}
function itinerary_init_sections()
{
  echo "<div section='sections' id='general-info-react'></div>";
}

function itinerary_init_dashboard()
{
  echo "<div section='dashboard' id='general-info-react'></div>";
}

function itinerary_ini_section($name)
{
  echo "<div section='$name' id='general-info-react'></div>";
}


add_action('admin_enqueue_scripts', function ($hook) {
  $dev = false;
  if (!substr($hook, 0, strlen('toplevel_page_itinerary-plugin')) ===  'toplevel_page_itinerary-plugin') {
    return;
  }
  if ($dev == true) {
    // DEV React dynamic loading
    $js_to_load = 'http://localhost:3000/static/js/main.js';
  } else {
    $js_to_load = plugin_dir_url(__FILE__) . 'admin_frontend/build/static/js/main.js';
    $css_to_load = plugin_dir_url(__FILE__) . 'admin_frontend/build/static/css/main.css';
  }
  wp_enqueue_style('react_css', $css_to_load);
  wp_enqueue_script('react_js', $js_to_load, '', mt_rand(10, 1000), true);

  // need to add nonce for rest request
  // https://developer.wordpress.org/rest-api/using-the-rest-api/authentication/
  wp_localize_script('react_js', 'wpApiSettings', array(
    'root' => esc_url_raw(rest_url()),
    'nonce' => wp_create_nonce('wp_rest'),
  ));
});

//  DB set up 

register_activation_hook(__FILE__, 'itinerary_install');

global  $wpdb, $table_name_itinerary, $table_name_sections, $table_name_fields, $table_name_section_values, $table_name_itinerary_data, $table_name_costings, $table_name_itinerary_channels, $table_name_reporting;

$table_name_itinerary = $wpdb->prefix . 'itineraries';
$table_name_sections = $wpdb->prefix . 'itinerary_sections';
$table_name_fields = $wpdb->prefix . 'itinerary_fields';
$table_name_section_values = $wpdb->prefix . 'itinerary_values';
$table_name_itinerary_data = $wpdb->prefix . 'itinerary_data';
$table_name_itinerary_channels = $wpdb->prefix . 'itinerary_rocket_channels';
$table_name_reporting = $wpdb->prefix . 'itinerary_reporting';
$table_name_costings = $wpdb->prefix . 'itinerary_costings';

function itinerary_install()
{
  global $wpdb, $table_name_itinerary, $table_name_sections, $table_name_fields, $table_name_section_values, $table_name_itinerary_data, $table_name_itinerary_channels, $table_name_reporting, $table_name_costings;
  $itinerary_db_version = '1.0';
  $charset_collate = $wpdb->get_charset_collate();

  $sql = "CREATE TABLE $table_name_itinerary (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        time_created datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
        time_updated datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
        name tinytext NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($sql);


  $sql = "CREATE TABLE $table_name_sections (
          id mediumint(9) NOT NULL AUTO_INCREMENT,
          time_created datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
          time_updated datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
          properties text,
          name tinytext NOT NULL,
          PRIMARY KEY  (id)
      ) $charset_collate;";

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($sql);

  $sql = "CREATE TABLE $table_name_fields (
          id mediumint(9) NOT NULL AUTO_INCREMENT,
          section mediumint(9) NOT NULL,
          position mediumint(9) NOT NULL,
          field_type tinytext NOT NULL,
          field_name tinytext NOT NULL,
          parent mediumint(9),
          type_properties text,
          PRIMARY KEY  (id)
      ) $charset_collate;";

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($sql);

  $sql = "CREATE TABLE $table_name_section_values (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    section mediumint(9)  NOT NULL,
    itinerary mediumint(9) NOT NULL,
    value text,
    PRIMARY KEY  (id)
  ) $charset_collate;";

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($sql);

  $sql = "CREATE TABLE $table_name_itinerary_data (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    itinerary_id mediumint(9) NOT NULL,
    time_updated datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
    json_data text  NOT NULL,
    PRIMARY KEY  (id),
    FOREIGN KEY(itinerary_id) REFERENCES $table_name_itinerary(id)
  ) $charset_collate;";

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($sql);

  add_option('itinerary_db_version', $itinerary_db_version);

  $sql = "CREATE TABLE $table_name_itinerary_channels (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    itinerary_id mediumint(9) NOT NULL,
    section_id mediumint(9) NOT NULL,
    json_data text NOT NULL,
    channel_id text,
    PRIMARY KEY (id),
    FOREIGN KEY (itinerary_id) REFERENCES $table_name_itinerary (id),
    FOREIGN KEY (section_id) REFERENCES $table_name_sections (id)
  ) $charset_collate;";

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($sql);

 
  $sql = "CREATE TABLE $table_name_reporting(
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    itinerary_id mediumint(9) NOT NULL,
    passenger text NOT NULL,
    summary text NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (itinerary_id) REFERENCES $table_name_itinerary (id)
  ) $charset_collate;";
    error_log($sql);

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($sql);

  $sql = "CREATE TABLE $table_name_costings (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    itinerary_id mediumint(9) NOT NULL,
    section_id mediumint(9) NOT NULL,
    listKey text NOT NULL,
    costing text,
    PRIMARY KEY (id),
    FOREIGN KEY (itinerary_id) REFERENCES $table_name_itinerary (id),
    FOREIGN KEY (section_id) REFERENCES $table_name_sections (id)
  ) $charset_collate;";

  error_log($sql);

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($sql);
}

// API setup
// %s (string)
// %d (integer)
// %f (float)
//  Itineraries
add_action('rest_api_init', function () {
  register_rest_route('itinerary/v1', 'itineraries', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'get_all_itineraries',
  ));
  register_rest_route('itinerary/v1', 'itineraries/create', array(
    'methods' => WP_REST_Server::CREATABLE,
    'callback' => 'create_new_itinerary',
  ));
  register_rest_route('itinerary/v1', 'itineraries/delete/(?P<itinerary_id>\d+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'delete_itinerary',
    'args' => array(
      'itinerary_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));

  //costings
   register_rest_route('itinerary/v1', 'costings', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'get_all_costings',
  ));
  register_rest_route('itinerary/v1', 'costings/create', array(
    'methods' => WP_REST_Server::CREATABLE,
    'callback' => 'create_new_costing',
  ));
  register_rest_route('itinerary/v1', 'costings/delete/(?P<costing_id>\d+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'delete_costing',
    'args' => array(
      'costing_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));

  //sections
  register_rest_route('itinerary/v1', 'sections', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'get_all_sections',
  ));
  register_rest_route('itinerary/v1', 'sections/create', array(
    'methods' => WP_REST_Server::CREATABLE,
    'callback' => 'create_new_section',
  ));
  register_rest_route('itinerary/v1', 'sections/delete/(?P<section_id>\d+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'delete_section',
    'args' => array(
      'section_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));
  //fields
  register_rest_route('itinerary/v1', 'fields/(?P<section_id>\d+)', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'get_all_fields',
    'args' => array(
      'section_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));
  register_rest_route('itinerary/v1', 'fields/create', array(
    'methods' => WP_REST_Server::CREATABLE,
    'callback' => 'create_new_field',
  ));
  register_rest_route('itinerary/v1', 'fields/delete/(?P<field_id>\d+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'itin_delete_field',
    'args' => array(
      'field_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));

  //field values
  register_rest_route('itinerary/v1', 'values/(?P<itinerary_id>\d+)/(?P<section_id>\d+)', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'get_all_section_values',
    'args' => array(
      'section_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
      'itinerary_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));

  register_rest_route('itinerary/v1', 'values/createOrUpdate', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'create_new_section_value',
  ));

  register_rest_route('itinerary/v1', 'values/delete/(?P<value_id>\d+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'delete_value',
    'args' => array(
      'value_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));

  register_rest_route('itinerary/v1', 'values/copyLast/(?P<itin_id>\d+)', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'copy_values_from_last_itin',
    'args' => array(
      'itin_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));

  register_rest_route('itinerary/v1', 'itineraries/updateApp', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'update_entry_in_db',
    'args' => array(
      'itinId' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));

  register_rest_route('itinerary/v1', 'raceMap', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'get_race_map',
  ));

  register_rest_route('itinerary/v1', 'data/(?P<itin_id>\d+)', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'get_itin_data',
    'args' => array(
      'itin_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));

  register_rest_route('itinerary/v1', 'ical/(?P<usertoken>\d+)', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'get_ical_for_user',
    'args' => array(
      'usertoken' => array(
        'validate_callback' => function ($param, $request, $key) {
          return true;
        }
      ),
    )
  ));
  register_rest_route('itinerary/v1', 'rocketChannel/create', array(
    'methods' => WP_REST_Server::CREATABLE,
    'callback' => 'create_rocket_channel',
  ));

  register_rest_route('itinerary/v1', 'rocketChannel/getChannels/(?P<itinerary_id>\d+)/(?P<section_id>\d+)', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'get_rocket_channels',
    'args' => array(
      'section_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
      'itinerary_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));

  register_rest_route('itinerary/v1', 'itineraries/updateReport/(?P<itinerary_id>\d+)', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'update_report',
    'args' => array(
      'itinerary_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));

  register_rest_route('itinerary/v1', 'itineraries/getDashboardFields', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'get_dashboard_fields',
  ));

  register_rest_route('itinerary/v1', 'itineraries/generateReport', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'generate_reporting_table',
  ));

  register_rest_route('itinerary/v1', 'itineraries/addDashboardField/(?P<field_id>\d+)', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'add_dashboard_field',
    'args' => array(
      'field_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));

});

/**
 * Return all costings
 */
function get_all_costings(){
  global $wpdb, $table_name_costings;
  $results = $wpdb->get_results("SELECT * FROM {$table_name_costings}", OBJECT);

  return rest_ensure_response($results);
}

/**
 * adds a new costing
 */
function create_new_costing(WP_REST_Request $request)
{
  global $wpdb, $table_name_costings;
  $body = json_decode($request->get_body());
  error_log(print_r($body,true));
  return $wpdb->insert(
    $table_name_costings,
    array(
      "itinerary_id"=>$body->itinerary_id,
      "section_id"=>$body->section_id,
      "listKey"=>$body->listKey,
      "costing" => json_encode($body->costing),
    ),
    array(
      '%d',
      '%d',
      "%s",
      '%s',
    )
  );
}

/**
 * DELETE costing
 */
function delete_costing($data){
  
}


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

// function update_reporting(WP_REST_REQUEST $request){
//   global $wpdb;
//   $itinId = $request['itinId'];
//   $json_data = json_decode($request->get_body());
//   $result = $wpdb->get_results("UPDATE `wp_itineraries` SET `reporting` = '1' WHERE `id` = '" . $itinId . "'");
//   return rest_ensure_response($result);
// }

function update_user_in_reporting($passenger_name, $passenger_object, $itin_id)
{
  global $wpdb, $table_name_reporting;
  $sql = "SELECT summary FROM $table_name_reporting WHERE itinerary_id = $itin_id AND passenger = '$passenger_name'";
  $summary = $wpdb->get_results($sql);

  if ($summary == NULL) {
    $wpdb->insert($table_name_reporting, array(
      'itinerary_id' => $itin_id,
      'passenger' => $passenger_name,
      'summary' => json_encode($passenger_object)
    ));
  } else {
    $wpdb->update($table_name_reporting, array(
      'summary' => json_encode($passenger_object)
    ), array(
      'itinerary_id' => $itin_id,
      'passenger' => $passenger_name
    ));
  }
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

  //get all itineraries
  $itineraries = $wpdb->get_results("SELECT id FROM wp_itineraries");


  //get all fields with reporting enabled
  $sql = 'SELECT * FROM ' . $table_name_fields . ' WHERE type_properties LIKE ' . "'" . '%"showOnDashboard":true%' . "'";
  
  // $fields_with_reporting = $wpdb->get_results("SELECT * FROM " . $table_name_fields . ` WHERE type_properties LIKE '%"showOnDashboard":true%';`);
  $fields_with_reporting = $wpdb->get_results($sql);
  foreach ($itineraries as $itin) {
    $tableDict = array();
    foreach ($fields_with_reporting as $field) {
      $root_key = get_root_key($field);
      [$parent_field, $parent_json_key, $field_json_key] = get_field_parent($field, $field->section);
      $data = $wpdb->get_results("SELECT value FROM " . $table_name_section_values . " WHERE itinerary = " . $itin->id . " AND section =" . $field->section);
      $values = json_decode($data[0]->value);
      error_log(json_encode($values));
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

    foreach ($tableDict as $passenger_name => $passenger_data) {
      update_user_in_reporting($passenger_name, $passenger_data, $itin->id);
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
  $tableDict[$passenger_data] = $user_obj;
}

function get_field_parent($field, $section_id)
{
  global $wpdb, $table_name_fields;
  if ($field->parent != null) {
  }
  $parent_field_to_user = $wpdb->get_results("SELECT * FROM $table_name_fields WHERE id = $field->parent AND section = $section_id");
  $parent_field_to_user = $parent_field_to_user[0];
  error_log(json_encode($parent_field_to_user));
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

function create_rocket_channel(WP_REST_Request $request)
{
  global $wpdb, $table_name_itinerary_channels;
  $params = $request->get_json_params();
  $itinId = $params['itineraryId'];
  $sectionId = $params['sectionId'];
  $jsonData = $params['jsonData'];
  $channelId = $params['channelId'];
  $sql = "INSERT INTO $table_name_itinerary_channels (itinerary_id, section_id, channel_id, json_data) VALUES ($itinId, $sectionId, '$channelId', '$jsonData')";
  $result = $wpdb->query($sql);
  return rest_ensure_response($result);
}

function get_rocket_channels($request)
{
  global $wpdb, $table_name_itinerary_channels;
  $itinId = $request['itinerary_id'];
  $sectionId = $request['section_id'];

  $sql = "SELECT * FROM $table_name_itinerary_channels WHERE itinerary_id = $itinId AND section_id = $sectionId";
  $sqlResult = $wpdb->get_results($sql);

  return rest_ensure_response($sqlResult);
}


/**
 * Get race map data from the db
 */

function get_race_map()
{
  global $wpdb, $table_name_itinerary_data;
  $raceMap = array();
  $raceData = $wpdb->get_results("select t.* from wp_itinerary_data t where t.time_updated = (select max(t1.time_updated) from wp_itinerary_data t1 where t1.itinerary_id = t.itinerary_id);");

  foreach ($raceData as $race) {
    $jsonData = json_decode($race->json_data);
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
  return (json_decode($result[0]->json_data));
}


/**
 * Creates new entry into the final values table of the db to read from react-dashboard
 */

function update_entry_in_db(WP_REST_Request $request)
{
  global $wpdb, $table_name_itinerary_data;
  $params = $request->get_json_params();
  $itinerary_id = $params['itinId'];
  $json_data = $params['json_data'];
  $time_updated = $params['time_updated'];
  $results = $wpdb->get_results(" INSERT INTO $table_name_itinerary_data (itinerary_id, time_updated, json_data) VALUES ($itinerary_id, $time_updated, '$json_data') ");
  return rest_ensure_response($results);
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
  global $wpdb, $table_name_itinerary, $table_name_section_values,  $table_name_itinerary_data;

  $wpdb->delete(
    $table_name_itinerary_data,
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

function update_moodel($data)
{
}
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
 * CREATE section
 */
function create_new_section(WP_REST_Request $request)
{
  global $wpdb, $table_name_sections;
  $body = json_decode($request->get_body());

  // Validate body 

  if (!property_exists($body, "name")) {
    return new WP_Error('400', esc_html__('Missing body parameter name', 'text_domain'), array('status' => 400));
  }
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


//adds extra stuff to user endpoint
function acf_to_rest_api($response, $user, $request)
{
  if (!function_exists('get_fields')) return $response;

  if (isset($user)) {
    $meta = get_user_meta($user->id);
    $data = get_userdata($user->id);
    $response->data['meta'] = $meta;
    $response->data['data'] = $data;
  }
  return $response;
}
add_filter('rest_prepare_user', 'acf_to_rest_api', 10, 3);


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

function getIcalDate($time, $timeZone, $inclTime = true)
{
  $eventTime = strtotime($time);
  if ($timeZone) {
    $timeZonesStr = file_get_contents(plugin_dir_url(__FILE__) . "admin_frontend/src/assets/timezones.json");
    $timeZones = json_decode($timeZonesStr, true);
    $timeZoneKey = array_search($timeZone, array_column($timeZones, 'text'));
    $timeZoneObj = $timeZones[$timeZoneKey];
    $timeZoneObj['offset'] = $timeZoneObj['offset'] * -1;
    $eventTime = strtotime("{$timeZoneObj['offset']} hours", $eventTime);
  } else {
    $ukTimeZone = new DateTimeZone("Europe/London");
    $datetime_UTC = date_create("now", timezone_open("Etc/GMT"));
    $offset = timezone_offset_get($ukTimeZone, $datetime_UTC) / 3600;
    $eventTime = strtotime("{$offset} hours", $eventTime);
  }
  return date('Ymd' . ($inclTime ? '\THis' : ''), $eventTime) . "Z";
}

//Ical
function get_ical_for_user(WP_REST_Request $request)
{
  global $wpdb, $table_name_itinerary_data;

  //for not its just an id
  $userToken = $request['usertoken'];

  $user = get_user_by('id', $userToken);
  $display_name = $user->display_name;
  //get last 3 itineraries 

  $raceMap = get_race_map();
  $lastRacesIds = array_map(
    fn ($race) =>
    $race['race_id'],
    array_slice($raceMap, -3, 3, true)
  );
  $stringRaceIds = implode(',', $lastRacesIds);
  $lastItins = $wpdb->get_results("SELECT * FROM $table_name_itinerary_data WHERE id in ( $stringRaceIds )");
  $lastItinsJson = array_map(fn ($itin) => json_decode($itin->json_data), $lastItins);
  // echo $lastItinsJson;
  //find all flight events 
  $flights = array_map(fn ($itin) => $itin->flights->Flight, $lastItinsJson);

  $flightsForTheUser = [];
  foreach ($flights as $flight) {
    foreach ($flight as $flightItem) {
      if (in_array($display_name, $flightItem->passengers)) {
        array_push($flightsForTheUser, $flightItem);
      }
    }
  }
  $eventsForTheFlights = [];
  foreach ($flightsForTheUser as $flight) {
    foreach ($flight->events as $event) {
      if (in_array($display_name, $event->appliesFor)) {
        array_push($eventsForTheFlights, $event);
      }
    }
  }

  $ical = "BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Eventr Calendar
X-WR-TIMEZONE:UTC
X-WR-CALDESC:Eventr Calendar
";
  foreach ($eventsForTheFlights as $event) {
    $ical .= "BEGIN:VEVENT
DTSTART:" . getIcalDate($event->time, $event->timezone) . "
DTEND:" . getIcalDate($event->time, $event->timezone) . "
DTSTAMP:" . date('Ymd' . '\THis', time()) . "Z
UID:" . str_replace(" ", "_", $event->time . $event->description) . "
SUMMARY:" . $event->description . "
STATUS:CONFIRMED
DESCRIPTION:" . $event->description . "
END:VEVENT
";
  }
  $ical .= "END:VCALENDAR";
  //set correct content-type-header
  header('Content-type: text/calendar; charset=utf-8');
  header('Content-Disposition: inline; filename=calendar.ics');
  //  echo  json_encode(   $flights);
  echo    $ical;
}
