<?php
    function flight_data_webhook_post($data) {

        //currently only works for if one flights info is sent back 
        //if multiple are sent back at a time need to subset 43 into a for loop. 
        //need this to go through like it is a loop i 
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


        $id = str_replace(" ", "" , $post_data["subscription"]["subject"]["id"]);
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
            /*            
            $info = $va->flights;
            foreach($info as $key =>$val){
                //at this level we are now ino each flight, need to compare bookref and date
                if($val->bookref && $val->bookref === $id){
                    //need to check date 
                    if($val->flightDate && $val->flightDate === $date){
                        //now we are here we update for that date 
                    }
                }
            */

            }
        
        //$date = str_replace(" ", "T", )
        //echo("    " . $values[3]["flights"][1]["departure"]["dep_time"]);
        //echo($values[3]["flights"][1]["departure"]["dep_estimated"]);
        $data2 = [];
        foreach($values as $ke=>$va){
            $val = json_encode($va);
            $sql = "UPDATE wp_itinerary_values SET value = %s  WHERE section = 2 and itinerary = {$ke}";
            $sql = $wpdb->prepare($sql,  $val);
            $data2[$ke] = $wpdb->query($sql);
        }

        return [$id, $date ,$post_data["flights"], $values, $data2];
    }