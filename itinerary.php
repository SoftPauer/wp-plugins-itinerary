<?php
/*
Plugin Name: Itinerary plugin
Description: Plugin to control itinerary 
Author: Andrius Murauskas
Version: 1.4.9
GitHub Plugin URI: https://github.com/SoftPauer/wp-plugins-itinerary
*/
require_once __DIR__ . '/lib/rest_api.php';
require_once __DIR__ . '/lib/bl/calendar.php';
require_once __DIR__ . '/lib/bl/costing.php';
require_once __DIR__ . '/lib/bl/dashboard.php';
require_once __DIR__ . '/lib/bl/field.php';
require_once __DIR__ . '/lib/bl/itinerary.php';
require_once __DIR__ . '/lib/bl/rocketchat.php';
require_once __DIR__ . '/lib/bl/section.php';
require_once __DIR__ . '/lib/bl/value.php';
require_once __DIR__ . '/lib/bl/flights.php';
require_once __DIR__ . '/lib/bl/flightWeebhook.php';
require_once __DIR__ . '/lib/bl/flightWeebhookData.php';
require_once __DIR__ . '/lib/bl/config.php';
require_once __DIR__ . '/lib/bl/wizard.php';
require_once __DIR__ . '/lib/bl/user.php';
require_once __DIR__ . '/lib/bl/mail.php';
require_once __DIR__ . '/lib/services/itinerary.php';
require_once __DIR__ . '/lib/services/section.php';
require_once __DIR__ . '/lib/services/value.php';


require_once __DIR__ . '/lib/db_updates.php';
require_once __DIR__ . '/lib/db_creation.php';


$itinerary_db_version = '1.2';

register_activation_hook(__FILE__, 'activation_function');


if (!defined('ITINABSPATH')) {
  define('ITINABSPATH', dirname(__FILE__));
}


function activation_function()
{
  error_log("wp-plugins-itinerary  activation_function");
  require_once(dirname(__FILE__) . '/lib/db_creation.php');
  itinerary_install();
}

function update_db_check()
{
  global $itinerary_db_version;
  $current = get_site_option('itinerary_db_version');
  if ($current != $itinerary_db_version) {
    error_log("wp-plugins-itinerary  current db version $current  target $itinerary_db_version ");
    error_log("wp-plugins-itinerary  updating db");
    update_db();
  }
}
add_action('plugins_loaded', 'update_db_check');


//adds extra stuff to user endpoint
function acf_to_rest_api($response, $user, $request)
{
  if (!function_exists('get_fields'))
    return $response;

  if (isset($user)) {
    $meta = get_user_meta($user->id);
    $data = get_userdata($user->id);
    $response->data['meta'] = $meta;
    $response->data['data'] = $data;
  }
  return $response;
}
add_filter('rest_prepare_user', 'acf_to_rest_api', 10, 3);
