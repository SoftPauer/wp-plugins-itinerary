<?php

    function update_value2($request){
        global $wpdb,$table_name_itinerary_data;
        $wpdb->show_errors(); 
        $id = $request['itin_id'];
        $json = (object)array("v2" => []);
        $results = $wpdb->get_results("SELECT section, value FROM {$wpdb->prefix}itinerary_values where itinerary = {$id}", OBJECT);
        $sections = $wpdb->get_results("SELECT id, name FROM {$wpdb->prefix}itinerary_sections", OBJECT);
        foreach($sections as $x => $v){
        $name = strtolower(str_replace(" ", "_", $v->name));
        $result = $wpdb->get_results("SELECT value FROM {$wpdb->prefix}itinerary_values where section = {intval($v->id)}", OBJECT);
        $json->$name = json_decode($result[0]->value);
        }
        $users = [];
        $user_result = $wpdb->get_results("SELECT id, user_login, user_email  FROM {$wpdb->prefix}users", OBJECT);
        foreach($user_result as $x=>$v){
        $firstName = $wpdb->get_results("SELECT meta_value FROM {$wpdb->prefix}usermeta where user_id = {intval($v->id)} and meta_key = 'first_name'", OBJECT);
        $surname = $wpdb->get_results("SELECT meta_value FROM {$wpdb->prefix}usermeta where user_id = {intval($v->id)} and meta_key ='last_name'", OBJECT);
        $department = $wpdb->get_results("SELECT meta_value FROM {$wpdb->prefix}usermeta where user_id = {intval($v->id)} and meta_key = 'department'", OBJECT);
        $users[] = (object)array("id" => $v->id, "firstName" =>$firstName[0]->meta_value, "surname" => $surname[0]->meta_value, "department" => $department[0]->meta_value, "email" =>$v->user_email, "userName"=>$v->user_login);
        }
        $json->users = $users;
        $format = '%Y-%m-%dT%H:%M:%S.%VZ';
        $strf = strftime($format);
        $json->updatedAt = $strf;
        $encoded = json_encode($json);
        $strf = substr(str_replace("T", " ", $strf), 0, 19);
        $outcome = $wpdb->get_results(" INSERT INTO {$wpdb->prefix}itinerary_data (itinerary_id, time_updated, json_data) VALUES ($id, '$strf', '$encoded') ");
        return($json);
    
    }
  
    function flight_data_webhook_post($data) {

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
        }
        catch(Exception $e) {
            //echo($e);
        }

        
        //$date = $post_data["flights"]["departure"]["scheduledTimeLocal"];
        $date = substr($post_data["flights"][0]["departure"]["scheduledTimeLocal"], 0, 10);
        //echo($date);


        //$id = str_replace(" ", "" , $post_data["subscription"]["subject"]["id"]);
        $id = str_replace(" ", "" , $post_data["flights"][0]["number"]);
        $results = $wpdb->get_results("SELECT itinerary, value FROM {$wpdb->prefix}itinerary_values where section = 2" , OBJECT);
        $values = [];


        foreach($results as $k => $v){
            $values[$v->itinerary] = json_decode($v->value, true);
        }
        //echo($values[3]["flights"][1]["flightDate"]);
        //echo("    " . $values[3]["flights"][1]["departure"]["dep_time"]);
        
        foreach($values as $ke=>$va){
            $no_of_flights = count($values[$ke]["flights"]);
            for($x = 0; $x < $no_of_flights; $x++){
                if($values[$ke]["flights"][$x]["bookref"] && $values[$ke]["flights"][$x]["bookref"] === $id){
                    //need to check date 
                    //echo($values[$ke]["flights"][$x]["flightDate"]);
                    if($values[$ke]["flights"][$x]["flightDate"] && $values[$ke]["flights"][$x]["flightDate"] === $date){
                        //now we are here we update for that date  
                        $flight_departs = false; 
                        $flight_arrives = false; 

                        if($values[$ke]["flights"][$x]["departure"] ){

                            $flight_departs = true;
                            $dep_time = str_replace(" ", "T",substr($post_data["flights"][0]["departure"]["scheduledTimeLocal"], 0,16));
                            echo("    :    " . $dep_time);
                            $values[$ke]["flights"][$x]["departure"]["dep_time"] = $dep_time;
                            $values[$ke]["flights"][$x]["departure"]["dep_estimated"] = $post_data["flights"][0]["departure"]["actualTimeLocal"] ? str_replace(" ", "T",substr($post_data["flights"][0]["departure"]["actualTimeLocal"], 0,16)) : $dep_time;
                            $values[$ke]["flights"][$x]["departure"]["dep_terminal"] = $post_data["flights"][0]["departure"]["terminal"];
                            $values[$ke]["flights"][$x]["departure"]["dep_name"] = $post_data["flights"][0]["departure"]["airport"]["name"];
                            $values[$ke]["flights"][$x]["departure"]["dep_gate"] = $post_data["flights"][0]["departure"]["gate"];
                        }
                        
                        if($values[$ke]["flights"][$x]["arrival"]){
                            $flight_arrives = true;
                            $arr_time = str_replace(" ", "T",substr($post_data["flights"][0]["arrival"]["scheduledTimeLocal"], 0,16));
                            $values[$ke]["flights"][$x]["arrival"]["arr_time"] = $arr_time;
                            $values[$ke]["flights"][$x]["arrival"]["arr_estimated"] = $post_data["flights"][0]["arrival"]["actualTimeLocal"] ? str_replace(" ", "T",substr($post_data["flights"][0]["arrival"]["actualTimeLocal"], 0,16)) : $arr_time;
                            $values[$ke]["flights"][$x]["arrival"]["arr_terminal"] = $post_data["flights"][0]["arrival"]["terminal"];
                            $values[$ke]["flights"][$x]["arrival"]["status"] = $post_data["flights"][0]["arrival"]["status"];
                            $values[$ke]["flights"][$x]["arrival"]["arr_name"] = $post_data["flights"][0]["arrival"]["airport"]["name"];
                        }
                        
                        if(!$flight_departs){
                            $dep_time = str_replace(" ", "T",substr($post_data["flights"][0]["departure"]["scheduledTimeLocal"], 0,16));
                            $values[$ke]["flights"][$x]["departure"] = (object) array("dep_time" => $dep_time, "dep_estimated" => $post_data["flights"][0]["departure"]["actualTimeLocal"] ? str_replace(" ", "T",substr($post_data["flights"][0]["departure"]["actualTimeLocal"], 0,16)) : $dep_time, "dep_terminal" => $post_data["flights"][0]["departure"]["terminal"]);
                        }
                        if(!$flight_arrives){
                            $arr_time = str_replace(" ", "T",substr($post_data["flights"][0]["arrival"]["scheduledTimeLocal"], 0,16));
                            $values[$ke]["flights"][$x]["arrival"] = (object) array("arr_time" => $arr_time, "arr_estimated" => $post_data["flights"][0]["arrival"]["actualTimeLocal"] ? str_replace(" ", "T",substr($post_data["flights"][0]["arrival"]["actualTimeLocal"], 0,16)) : $arr_time, "arr_terminal" => $post_data["flights"][0]["arrival"]["terminal"]);
                        }

                    }
                }
            }

            }
    
        $data2 = [];
        foreach($values as $ke=>$va){
            $val = json_encode($va);
            $sql = "UPDATE wp_itinerary_values SET value = %s  WHERE section = 2 and itinerary = {$ke}";
            $sql = $wpdb->prepare($sql,  $val);
            $ans = $wpdb->query($sql);
            $data2[$ke] = $ans;
            if($ans){
                $responses = update_value2(['itin_id' => $ke]);
            }
            
        }

        //return [$id, $id2, $date ,$post_data["flights"], $values, $data2, $responses];
        return($data2);
    }