<?php

    //first one 
    //$rapid_api_key = "778fa0422cmsh9f0ace4554c47a9p192760jsnf78deb6beb27";
    $rapid_api_key = "893889ae7amsh392221cca58cf8fp15c757jsn2890be49e294";
    $rapid_api_host = "aerodatabox.p.rapidapi.com";

    // Create new webhook. 
    // Needs plane_iata and webhook_url
    function post_new_webhook($data) {
        
        $post_data = $data->get_json_params();
        global $rapid_api_key, $rapid_api_host;

        
        if(isset($post_data['plane_iata']) && isset($post_data['webhook_url'])) {
            $curl = curl_init();

            curl_setopt_array($curl, array(
                CURLOPT_URL => 'https://aerodatabox.p.rapidapi.com/subscriptions/webhook/FlightByNumber/' . $post_data['plane_iata'],
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS =>'{"url":"' . $post_data['webhook_url'] . '"}',
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/json',
                    'X-RapidAPI-Key: ' . $rapid_api_key,
                    'X-RapidAPI-Host: ' . $rapid_api_host
                ),
            ));
            curl_exec($curl);
            curl_close($curl);
            return (true);
        }
        return (false);
        
    }

    // Delete a webhook.
    // Needs either webhook_id or plane_iata
    function delete_webhook($data) {
        $post_data = $data->get_json_params();

        if(isset($post_data['webhook_id'])) {
            delete_webhook_id($post_data['webhook_id']);
            return(true);
        } else if (isset($post_data['plane_iata'])) {
            $webhooks = get_webhooks();
            foreach($webhooks as $webhook) {
                if(isset($webhook['subject'])) {
                    if (isset($webhook['subject']['id'])) {
                        if (str_replace(' ', '', $webhook['subject']['id']) === $post_data['plane_iata']) {
                            delete_webhook_id($webhook['id']);
                        }
                    }
                }
            }
        }
        return (false);
    }

    function delete_webhook_id($id) {
        global $rapid_api_key, $rapid_api_host;
        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://aerodatabox.p.rapidapi.com/subscriptions/webhook/' . $id['webhook_id'],
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'DELETE',
            CURLOPT_HTTPHEADER => array(
                'X-RapidAPI-Key: ' . $rapid_api_key,
                'X-RapidAPI-Host: ' . $rapid_api_host
            ),
        ));

        curl_exec($curl);
        curl_close($curl);
        return(true);
    }

    // Gets all webhooks
    function get_webhooks() {
        global $rapid_api_key, $rapid_api_host;

        $curl = curl_init();

        curl_setopt_array($curl, array(
            CURLOPT_URL => 'https://aerodatabox.p.rapidapi.com/subscriptions/webhook',
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => '',
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 0,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => 'GET',
            CURLOPT_HTTPHEADER => array(
                'X-RapidAPI-Key: ' . $rapid_api_key,
                'X-RapidAPI-Host: ' . $rapid_api_host
            ),
        ));

        $response = curl_exec($curl);

        curl_close($curl);
        return (json_decode($response));

    }




    function bl_cron_exec(){

        return update_webhooks();
    }
    //still need to sort 
    //cron job to happen every day when it occours 
    //when we initialize it 
    function cron_wb(){    

        global $wpdb;
        try {
            $flight_data_old = file_get_contents(__DIR__ . "/cron.json");
            if ($flight_data_old) {
                $flight_data_old_json = json_decode($flight_data_old, true);
                $tmp_time = strval(time());
                $flight_data_old_json[$tmp_time] = $tmp_time . " : " .  wp_next_scheduled( 'bl_cron_hook' );
                file_put_contents(__DIR__ . "/cron.json", json_encode($flight_data_old_json));
            } else {
                $tmp_time = strval(time());
                $new_file->$tmp_time = 'START';
                file_put_contents(__DIR__ . "/cron.json", json_encode($new_file));
            }
        }
        catch(Exception $e) {
            //echo($e);
        }

        $results = $wpdb->get_results("SELECT option_value FROM {$wpdb->prefix}options where option_id = 1" , OBJECT);
        var_dump($results);
        $webhook_url = $results[0]->option_value . "/wp-json/itinerary/v1/flights/webhook";
        $results = $wpdb->get_results("SELECT itinerary, value FROM {$wpdb->prefix}itinerary_values where section = 2" , OBJECT);
        $hooks = get_webhooks();
        $current_ids = [];
        foreach($hooks as $key =>$val){
            $current_ids[] = str_replace(" ", "" , $val->subject->id);
        }


        foreach($results as $k => $v){
            $x = json_decode($v->value,true)["flights"];
            foreach($x as $ka=>$va) {
                $date = $va["flightDate"];
                if (strtotime($date) <= (time() + 24*60*60*5) && strtotime($date) >= (time() - 24*60*60*2) && $va["bookref"]){  
                    $book_ref = $va["bookref"];
                    if(!in_array($book_ref, $current_ids)){
                        $data = json_encode((object)array("plane_iata" => $book_ref,"webhook_url"=>$webhook_url ));
                        $request   = new WP_REST_Request( 'POST', 'your route here' );
                        $request->set_header( 'content-type', 'application/json' );
                        $request->set_body($data);
                        if(post_new_webhook($request)){
                            $current_ids[] = $book_ref;
                        }
                    }
                }
            }
            
        }
        return [$hooks, $current_ids, $webhook_url];
    }
    //still to do on this 
    //make the cron task once per day instead of every seconds 
    //do time // time for one day round up and times again 

    function update_webhooks(){    
        //function that initialize webhooks when the flights are within 5 days of the flight 
        //webhooks expire after seven days 

        global $wpdb;
        try {
            $flight_data_old = file_get_contents(__DIR__ . "/cron.json");
            if ($flight_data_old) {
                $flight_data_old_json = json_decode($flight_data_old, true);
                $tmp_time = strval(time());
                $flight_data_old_json[$tmp_time] = $tmp_time . " : " .  wp_next_scheduled( 'bl_cron_hook' );
                file_put_contents(__DIR__ . "/cron.json", json_encode($flight_data_old_json));
            } else {
                $tmp_time = strval(time());
                $new_file->$tmp_time = 'START';
                file_put_contents(__DIR__ . "/cron.json", json_encode($new_file));
            }
        }
        catch(Exception $e) {
            //echo($e);
        }

        $results = $wpdb->get_results("SELECT option_value FROM {$wpdb->prefix}options where option_id = 1" , OBJECT);
        var_dump($results);
        $webhook_url = $results[0]->option_value . "/wp-json/itinerary/v1/flights/webhook";
        $results = $wpdb->get_results("SELECT itinerary, value FROM {$wpdb->prefix}itinerary_values where section = 2" , OBJECT);
        $hooks = get_webhooks();
        $current_ids = [];
        foreach($hooks as $key =>$val){
            $current_ids[] = str_replace(" ", "" , $val->subject->id);
        }


        foreach($results as $k => $v){
            $x = json_decode($v->value,true)["flights"];
            foreach($x as $ka=>$va) {
                $date = $va["flightDate"];
                if (strtotime($date) <= (time() + 24*60*60*5) && strtotime($date) >= (time() - 24*60*60*2) && $va["bookref"]){  
                    $book_ref = $va["bookref"];
                    if(!in_array($book_ref, $current_ids)){
                        $data = json_encode((object)array("plane_iata" => $book_ref,"webhook_url"=>$webhook_url ));
                        $request   = new WP_REST_Request( 'POST', 'your route here' );
                        $request->set_header( 'content-type', 'application/json' );
                        $request->set_body($data);
                        if(post_new_webhook($request)){
                            $current_ids[] = $book_ref;
                        }
                    }
                }
            }
            
        }
        return [$hooks, $current_ids, $webhook_url];
    }


    add_action('bl_cron_hook', 'bl_cron_exec');

    add_filter( 'cron_schedules', 'example_add_cron_interval' );
    function example_add_cron_interval( $schedules ) { 
        $schedules['sixty_seconds'] = array(
            'interval' => 60,
            'display'  => esc_html__( 'Every Sixty Seconds' ), );
        return $schedules;
    }


    function check_next_cron_job(){
        return wp_next_scheduled( 'bl_cron_hook' ) ? wp_next_scheduled( 'bl_cron_hook' ) . " current time is " . time() : "there is no current cron job under this name";
    }

    function push_flight_cron_job(){  
        
        //finding the time for the end of the day 
        $day = 24*60*60;
        $end_of_day =  $day * ceil(time()/$day);
        if ( ! wp_next_scheduled( 'bl_cron_hook' ) ) {
            wp_schedule_event($end_of_day, 'daily', 'bl_cron_hook' );
            return "schedule has been created"; 
        }
        return "Already existed";
    }

    function delete_flight_cron_job(){
        $timestamp = wp_next_scheduled( 'bl_cron_hook' );
        return wp_unschedule_event( $timestamp, 'bl_cron_hook' );
    }

