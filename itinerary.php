<?php
/*
Plugin Name: Itinerary plugin
Description: Plugin to control itinerary 
Author: Andrius Murauskas
Version: 1.2.24

GitHub Plugin URI: https://github.com/SoftPauer/wp-plugins-itinerary
*/
require_once __DIR__.'/lib/rest_api.php';
require_once __DIR__.'/lib/bl/calendar.php';
require_once __DIR__.'/lib/bl/costing.php';
require_once __DIR__.'/lib/bl/dashboard.php';
require_once __DIR__.'/lib/bl/field.php';
require_once __DIR__.'/lib/bl/itinerary.php';
require_once __DIR__.'/lib/bl/rocketchat.php';
require_once __DIR__.'/lib/bl/section.php';
require_once __DIR__.'/lib/bl/value.php';

require_once __DIR__.'/lib/db_creation.php';

add_action('admin_menu', 'itinerary_plugin_setup_menu');
register_activation_hook(__FILE__, 'activation_function');

function activation_function(){
  require_once( dirname( __FILE__ ) . '/lib/db_creation.php' );
  itinerary_install();
}

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