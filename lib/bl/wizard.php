<?php

function get_wizard()
{

  $array_sections = array();

  $string_sections = file_get_contents(ITINABSPATH . '/lib/section_wizard/sections.json');
  $json_sections = json_decode($string_sections, true);


  foreach ($json_sections as $section) {
    array_push($array_sections, [
      "sectionName" => $section["Name"],
      "description" => $section["Description"],
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
  $body = json_decode($request->get_body());

  $string_sections = file_get_contents(ITINABSPATH . '/lib/section_wizard/sections.json');
  $json_sections = json_decode($string_sections, true);

  $res = array();
  foreach ($body as $section) {
    $res["section"] =  $section;
    try {
      error_log("Setting up " . $section);
      $sql = file_get_contents(ITINABSPATH . '/lib/section_wizard/' .  $json_sections[$section]["folder"] .  '/db.sql');

      $sql_array = explode(";", $sql);
      foreach ($sql_array as $key => $sqls) {
        $sql = trim($sqls);
        if ($sql != "") {
          if ($wpdb->query($sqls)) {
            $res["status" . $key] =  "success";
          } else {
            $res["status" . $key] =  "failed";
          }
        }
      }
    } catch (\Throwable $e) {
      $res["status"] =  "failed";
      $res["failureReason"] =  $e->getMessage();
    }

    array_push($array_result, $res);
    $res =  array();
  }
  update_option("isWizardComplete", true);
  return rest_ensure_response($array_result);

  // return rest_ensure_response(array('isWizardComplete' =>  $isWizardComplete));
}
