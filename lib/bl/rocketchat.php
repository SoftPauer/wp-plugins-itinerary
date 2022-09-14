
<?php
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
