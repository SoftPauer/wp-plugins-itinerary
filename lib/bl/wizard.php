<?php

function get_wizard()
{

  $array_sections = array();

  $string_sections = file_get_contents(ITINABSPATH . '/lib/section_wizard/sections.json');
  $json_sections = json_decode($string_sections, true);


  foreach ($json_sections as $key => $section) {
    array_push($array_sections, [
      "key" => $key,
      "sectionName" => $section["name"],
      "description" => $section["description"],
      "cards" => $section["cards"],
      "backendScreenShot" => get_site_url() . "/wp-content/plugins/wp-plugins-itinerary/lib/section_wizard/" . $section["folder"] . "/backend.png",
      "personalScreenShot" => get_site_url() . "/wp-content/plugins/wp-plugins-itinerary/lib/section_wizard/" . $section["folder"] . "/personalScreenShot.jpg",
      "teamScreenShot" => get_site_url() . "/wp-content/plugins/wp-plugins-itinerary/lib/section_wizard/" . $section["folder"] . "/teamScreenShot.jpg"
    ]);
  }
  return rest_ensure_response($array_sections);
}

function complete_wizard(WP_REST_Request $request)
{
  include_once ABSPATH . 'wp-admin/includes/upgrade.php';
  global $wpdb;
  $array_result = array();
  $body = json_decode($request->get_body(), true);
  $sections = $body[2];
  $eventInfo = $body[0];
  $eventDetails = $body[1];

  $string_sections = file_get_contents(ITINABSPATH . '/lib/section_wizard/sections.json');
  $json_sections = json_decode($string_sections, true);

  $itinCreation = create_itinerary($eventInfo["title"]);
  if ($itinCreation) {
    array_push($array_result, ActionResponse::createSuccess("Itinerary creation"));
  } else {
    array_push($array_result, ActionResponse::createError("Itinerary creation failed ", "Itinerary creation"));
  }

  $res = array();
  foreach ($sections as $section) {
    try {
      error_log("Setting up " . $section);
      $sql = file_get_contents(ITINABSPATH . '/lib/section_wizard/' . $json_sections[$section]["folder"] . '/db.sql');
      if ($sql == false) {
        error_log("No db.sql file for section:  " . $section);
        throw new Exception("No db.sql file for section:  " . $section, 1);
      } else {
        $sql_array = explode(";", $sql);
        foreach ($sql_array as $key => $sqls) {
          $sql = trim($sqls);
          if ($sql != "") {
            if ($wpdb->query($sqls) == false) {
              $res = ActionResponse::createError("Failed sql execution", $section);
              continue;
            }
          }
        }
        $res = ActionResponse::createSuccess($section);
      }
    } catch (\Throwable $e) {

      $res = ActionResponse::createError($e->getMessage());
    }
    array_push($array_result, $res);
  }

  $itin = find_itinerary($eventInfo["title"]);

  $section = get_section_by_name('Event Information'); // default required section
  $data = (object) array(
    'Event_Type' => $eventDetails["eventType"],
    'Address_Line_1' => $eventDetails["addressLine1"],
    'Address_Line_2' => $eventDetails["addressLine2"],
    'Main_Venue' => $eventDetails["mainVenue"],
    'City' => $eventDetails["city"],
    'Country' => $eventDetails["country"],
    'Postal_Code_or_ZIP' => $eventDetails["postCode"],
    'Start_Date' => $eventInfo["startDate"],
    'End_Date' => $eventInfo["endDate"],
  );

  $value = (object) array(
    'section' => $section->id,
    'itinerary' => $itin->id,
    'value' => $data,
  );

  try {
    create_update_value($value);
    array_push($array_result, ActionResponse::createSuccess("Update values"));
  } catch (\Throwable $th) {
    error_log($th->getMessage()());
    array_push($array_result, ActionResponse::createError($th->getMessage()(), "Update values"));
  }

  update_app($itin->id);

  update_option("isWizardComplete", true);
  return rest_ensure_response($array_result);
}