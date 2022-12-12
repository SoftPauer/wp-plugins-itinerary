<?php

function update_value2($request)
{
    global $wpdb, $table_name_sections, $table_name_section_values,$table_name_itinerary_data;

    $wpdb->show_errors();
    $id = $request['itin_id'];
    $json = (object)array("v2" => []);
    $sections = $wpdb->get_results("SELECT id, name, properties  FROM $table_name_sections", OBJECT);
    foreach ($sections as $v) {
      $name = strtolower(str_replace(" ", "_", $v->name));
      $result = $wpdb->get_results("SELECT value FROM $table_name_section_values where section = {intval($v->id)} and itinerary = $id", OBJECT);
      $props = json_decode($v->properties);
      if (!isset($props->version)) {
        $version = 1;
      } else {
        $version = $props->version;
      }
      if ($version == 2) {
        if (isset($result[0])) {
          $v2Section = array(
            "sectionName" => $name,
            "sectionDisplayName" => $props->sectionDisplayName,
            "sectionDisplayNameTeams" =>
            $props->sectionDisplayNameTeams ??
              $props->sectionDisplayName,
            "renderer" => $props->renderer,
            "rendererOptions" => $props->rendererOptions,
            "data" => json_decode($result[0]->value)
          );
          array_push($json->v2, $v2Section);
        }
      } else {
        if (isset($result[0])) {
          $json->$name = json_decode($result[0]->value);
        }
      }
    }
    $users = [];
    $user_result = $wpdb->get_results("SELECT id, user_login, user_email  FROM {$wpdb->prefix}users", OBJECT);
    foreach ($user_result as $v) {
      $meta = get_user_meta($v->id);
      $firstName = $meta["first_name"][0];
      $surname = $meta["last_name"][0];
      $department = $meta["department"][0];
      $users[] = (object)array("id" => $v->id, "firstName" => $firstName, "surname" => $surname, "department" => $department, "email" => $v->user_email, "userName" => $v->user_login);
    }
    $json->users = $users;
    $format = '%Y-%m-%dT%H:%M:%S.%VZ';
    $strf = strftime($format);
    $json->updatedAt = $strf;
    $encoded = json_encode(json_encode($json));
    $strf = substr(str_replace("T", " ", $strf), 0, 19);
    $wpdb->get_results(" INSERT INTO $table_name_itinerary_data (itinerary_id, time_updated, json_data) VALUES ($id, '$strf', $encoded) ");
    return ([$id, $json]);
}

function flight_data_webhook_post($data)
{

    global $wpdb;

    $post_data = $data->get_json_params();

    try {
        $flight_data_old = file_get_contents(__DIR__ . "/flight_data_webhook.json");
        if ($flight_data_old) {
            $flight_data_old_json = json_decode($flight_data_old, true);
            $tmp_time = strval(time());
            $flight_data_old_json[$tmp_time] = $post_data;
            file_put_contents(__DIR__ . "/flight_data_webhook.json", json_encode($flight_data_old_json));
        } else {
            $tmp_time = strval(time());
            $new_file->$tmp_time = 'START';
            file_put_contents(__DIR__ . "/flight_data_webhook.json", json_encode($new_file));
        }
    } catch (Exception $e) {
        //echo($e);
    }


    //$date = $post_data["flights"]["departure"]["scheduledTimeLocal"];
    $date = substr($post_data["flights"][0]["departure"]["scheduledTimeLocal"], 0, 10);
    //echo($date);


    //$id = str_replace(" ", "" , $post_data["subscription"]["subject"]["id"]);
    $id = str_replace(" ", "", $post_data["flights"][0]["number"]);
    $results = $wpdb->get_results("SELECT itinerary, value FROM {$wpdb->prefix}itinerary_values where section = 2", OBJECT);
    $values = [];


    foreach ($results as $k => $v) {
        $values[$v->itinerary] = json_decode($v->value, true);
    }
    //echo($values[3]["flights"][1]["flightDate"]);
    //echo("    " . $values[3]["flights"][1]["departure"]["dep_time"]);

    foreach ($values as $ke => $va) {
        $no_of_flights = count($values[$ke]["flights"]);
        for ($x = 0; $x < $no_of_flights; $x++) {
            if ($values[$ke]["flights"][$x]["bookref"] && $values[$ke]["flights"][$x]["bookref"] === $id) {

                if ($values[$ke]["flights"][$x]["flightDate"] && $values[$ke]["flights"][$x]["flightDate"] === $date) {
                    $flight_departs = false;
                    $flight_arrives = false;


                    if ($values[$ke]["flights"][$x]["departure"]) {

                        $flight_departs = true;
                        $dep_time = str_replace(" ", "T", substr($post_data["flights"][0]["departure"]["scheduledTimeLocal"], 0, 16));
                        echo ("    :    " . $dep_time);
                        $values[$ke]["flights"][$x]["departure"]["dep_time"] = $dep_time;
                        $values[$ke]["flights"][$x]["departure"]["dep_estimated"] = $post_data["flights"][0]["departure"]["actualTimeLocal"] ? str_replace(" ", "T", substr($post_data["flights"][0]["departure"]["actualTimeLocal"], 0, 16)) : $dep_time;
                        $values[$ke]["flights"][$x]["departure"]["dep_terminal"] = $post_data["flights"][0]["departure"]["terminal"];
                        $values[$ke]["flights"][$x]["departure"]["dep_name"] = $post_data["flights"][0]["departure"]["airport"]["name"];
                        $values[$ke]["flights"][$x]["departure"]["dep_gate"] = $post_data["flights"][0]["departure"]["gate"];
                    }

                    if ($values[$ke]["flights"][$x]["arrival"]) {
                        echo ("wooooooo");
                        $flight_arrives = true;
                        $arr_time = str_replace(" ", "T", substr($post_data["flights"][0]["arrival"]["scheduledTimeLocal"], 0, 16));
                        $values[$ke]["flights"][$x]["arrival"]["arr_time"] = $arr_time;
                        $values[$ke]["flights"][$x]["arrival"]["arr_estimated"] = $post_data["flights"][0]["arrival"]["actualTimeLocal"] ? str_replace(" ", "T", substr($post_data["flights"][0]["arrival"]["actualTimeLocal"], 0, 16)) : $arr_time;
                        $values[$ke]["flights"][$x]["arrival"]["arr_terminal"] = $post_data["flights"][0]["arrival"]["terminal"];
                        $values[$ke]["flights"][$x]["arrival"]["status"] = $post_data["flights"][0]["arrival"]["status"];
                        $values[$ke]["flights"][$x]["arrival"]["arr_name"] = $post_data["flights"][0]["arrival"]["airport"]["name"];
                    }

                    if (!$flight_departs) {
                        $dep_time = str_replace(" ", "T", substr($post_data["flights"][0]["departure"]["scheduledTimeLocal"], 0, 16));
                        $values[$ke]["flights"][$x]["departure"] = (object) array("dep_time" => $dep_time, "dep_estimated" => $post_data["flights"][0]["departure"]["actualTimeLocal"] ? str_replace(" ", "T", substr($post_data["flights"][0]["departure"]["actualTimeLocal"], 0, 16)) : $dep_time, "dep_terminal" => $post_data["flights"][0]["departure"]["terminal"], "dep_name" => $post_data["flights"][0]["departure"]["airport"]["name"]);
                    }
                    if (!$flight_arrives) {
                        $arr_time = str_replace(" ", "T", substr($post_data["flights"][0]["arrival"]["scheduledTimeLocal"], 0, 16));
                        $values[$ke]["flights"][$x]["arrival"] = (object) array("arr_time" => $arr_time, "arr_estimated" => $post_data["flights"][0]["arrival"]["actualTimeLocal"] ? str_replace(" ", "T", substr($post_data["flights"][0]["arrival"]["actualTimeLocal"], 0, 16)) : $arr_time, "arr_terminal" => $post_data["flights"][0]["arrival"]["terminal"], "arr_name" => $post_data["flights"][0]["arrival"]["airport"]["name"]);
                    }
                }
            }
        }
    }
    $responses = [];
    $data2 = [];
    foreach ($values as $ke => $va) {
        $val = json_encode($va);
        $sql = "UPDATE wp_itinerary_values SET value = %s  WHERE section = 2 and itinerary = {$ke}";
        $sql = $wpdb->prepare($sql,  $val);
        $ans = $wpdb->query($sql);
        $data2[$ke] = $ans;
        echo ("got to here number : " . $ke);
        $responses[] = update_value2(['itin_id' => $ke]);
    }

    //return [$id, $date ,$post_data["flights"], $values, $data2, $responses];
    return ($data2);
}
