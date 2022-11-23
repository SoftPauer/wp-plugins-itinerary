<?php
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
  
  //flights
  register_rest_route('itinerary/v1', 'flights/updateFlightData', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'update_flight_data',
  ));

  register_rest_route('itinerary/v1', 'flights/practice', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'practice',
  ));


  //costings

  register_rest_route('itinerary/v1', 'costings/update', array(
    'methods' => WP_REST_Server::CREATABLE,
    'callback' => 'updating_listKey',
  ));
  
   register_rest_route('itinerary/v1', 'costings/(?P<itinerary_id>\d+)', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'get_all_costings',
    'args' => array(
      'itinerary_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
  ));
  register_rest_route('itinerary/v1', 'costings/create', array(
    'methods' => WP_REST_Server::CREATABLE,
    'callback' => 'create_new_costing',
  ));
  register_rest_route('itinerary/v1', 'costings/delete/(?P<itinerary_id>\d+)', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'delete_costing',
    'args' => array(
      'itinerary_id' => array(
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

  register_rest_route('itinerary/v1', 'values/copyItinerary/(?P<itin_id>\d+)', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'copy_all_values_from_selected_itinerary',
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

  register_rest_route('itinerary/v1', 'itineraries/generateReport/(?P<itinerary_id>\d+)', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'generate_reporting_table',
    'args' => array(
      'itinerary_id' => array(
        'validate_callback' => function ($param, $request, $key) {
          return is_numeric($param);
        }
      ),
    )
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

  //flight Webhooks
  register_rest_route('itinerary/v1', 'flights/webhook', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'flight_data_webhook_post',
  ));

  register_rest_route('itinerary/v1', 'flights/post-webhook', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'post_new_webhook',
  ));

  register_rest_route('itinerary/v1', 'flights/get-webhook', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'get_webhooks',
  ));

  register_rest_route('itinerary/v1', 'flights/delete-webhook', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'delete_webhook',
  ));

  register_rest_route('itinerary/v1', 'flights/future-flight', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'request_future_flight_data',
  ));

  register_rest_route('itinerary/v1', 'flights/future-flight-wb', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'request_future_flight_data_wb',
  ));

  
  register_rest_route('itinerary/v1', 'flights/cron', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'check_next_cron_job',
  ));

  
  register_rest_route('itinerary/v1', 'flights/cron', array(
    'methods' => WP_REST_Server::EDITABLE,
    'callback' => 'push_flight_cron_job',
  ));

  register_rest_route('itinerary/v1', 'flights/cron', array(
    'methods' => WP_REST_Server::DELETABLE,
    'callback' => 'delete_flight_cron_job',
  ));
  
  register_rest_route('itinerary/v1', 'flights/cron-wb', array(
    'methods' => WP_REST_Server::READABLE,
    'callback' => 'cron_wb',
  ));

});