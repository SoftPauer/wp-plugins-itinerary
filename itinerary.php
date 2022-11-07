<?php
/*
Plugin Name: Itinerary plugin
Description: Plugin to control itinerary 
Author: Andrius Murauskas
Version: 1.2.31

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

register_activation_hook(__FILE__, 'activation_function');

function activation_function(){
  require_once( dirname( __FILE__ ) . '/lib/db_creation.php' );
  itinerary_install();
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