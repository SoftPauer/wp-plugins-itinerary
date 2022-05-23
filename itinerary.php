<?php
/*
Plugin Name: Itinerary plugin
Description: Plugin to control itinerary 
Author: Andrius Murauskas
Version: 1.0.2
GitHub Plugin URI: https://github.com/SoftPauer/wp-plugins-itinerary
*/
add_action('admin_menu', 'itinerary_plugin_setup_menu');

function itinerary_plugin_setup_menu()
{
  add_menu_page('Sections', 'Sections', 'manage_options', 'itinerary-plugin-sections', 'itinerary_init_sections');

  global $wpdb;
  $sections = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}itinerary_sections", OBJECT);
  foreach ($sections as &$section) {
    global $section_gl;
    $section_gl = $section;
    add_menu_page(
      'Sections-'  . $section->name,
      $section->name,
      'manage_options',
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
    'moodle_base_url' => get_option('moodle_base_url'),
    'moodle_ws_token' => get_option('moodle_ws_token')
  ));
});

//  DB set up 

register_activation_hook(__FILE__, 'itinerary_install');

global  $wpdb, $table_name_itinerary, $table_name_sections, $table_name_fields, $table_name_section_values, $table_name_itinerary_data;

$table_name_itinerary = $wpdb->prefix . 'itineraries';
$table_name_sections = $wpdb->prefix . 'itinerary_sections';
$table_name_fields = $wpdb->prefix . 'itinerary_fields';
$table_name_section_values = $wpdb->prefix . 'itinerary_values';
$table_name_itinerary_data = $wpdb->prefix . 'itinerary_data';

function itinerary_install()
{
  global $wpdb, $table_name_itinerary, $table_name_sections, $table_name_fields, $table_name_section_values, $table_name_itinerary_data;
  $itinerary_db_version = '1.0';
  add_option('moodle_base_url', 'replace me');
  add_option('moodle_ws_token', 'replace me');
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
    json_data json NOT NULL,
    PRIMARY KEY  (id),
    FOREIGN KEY(itinerary_id) REFERENCES $table_name_itinerary(id)
  ) $charset_collate;";

  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
  dbDelta($sql);

  add_option('itinerary_db_version', $itinerary_db_version);
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
});

/**
 * Get race map data from the db
 */

function get_race_map()
{
  global $wpdb, $table_name_itinerary_data;
  $raceMap = array();
  $raceData = $wpdb->get_results("select t.* from $table_name_itinerary_data t where t.time_updated = (select max(t1.time_updated) from $table_name_itinerary_data t1 where t1.itinerary_id = t.itinerary_id);");

  foreach ($raceData as $race) {
    error_log($race->json_data);
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
      "last_updated" => strtotime($race->time_updated)
    );
    array_push($raceMap, $race_item);
  }

  return ($raceMap);
}

/**
 * get json data for race id 
 */

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
  global $wpdb, $table_name_itinerary, $table_name_section_values;
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
  $results = $wpdb->get_results("SELECT * FROM {$table_name_fields} WHERE section = {$data['section_id']}", OBJECT);
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
  error_log($sql); // debug
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
  $results = get_section_value($data['section_id'], $data['itinerary_id']);
  if (empty($results)) {
    return rest_ensure_response(null);
  }
  return rest_ensure_response($results[0]);
}

/**
 * Create field value
 */
function create_new_section_value(WP_REST_Request $request)
{
  $body = json_decode($request->get_body());
  error_log(print_r($body, true)); // debug

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
