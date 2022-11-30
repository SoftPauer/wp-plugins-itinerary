<?php
require_once __DIR__.'/value.php';

function request_future_flight_data($data){

    global $wpdb;
    $response = $data->get_json_params();
    $bookref = $response["bookref"];
    $date = $response["flightDate"];
    $curl = curl_init();
   
    curl_setopt_array($curl, array(
    CURLOPT_URL => 'https://aerodatabox.p.rapidapi.com/flights/number/' . $bookref . "/" . $date ,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_ENCODING => '',
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 0,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => 'GET',
    CURLOPT_HTTPHEADER => array(
    'X-RapidAPI-Key: 778fa0422cmsh9f0ace4554c47a9p192760jsnf78deb6beb27',
    'X-RapidAPI-Host: aerodatabox.p.rapidapi.com'
    ),
    ));
    
    $post_data = curl_exec($curl);

    curl_close($curl);
    $post_data = json_decode($post_data, true);
    $results = $wpdb->get_results("SELECT itinerary, value FROM {$wpdb->prefix}itinerary_values where section = 2", OBJECT);
    $values = [];
    foreach($results as $k => $v){
        $values[$v->itinerary] = json_decode($v->value, true);
    }
    foreach($values as $ke=>$va){
        $no_of_flights = count($values[$ke]["flights"]);
        for($x = 0; $x < $no_of_flights; $x++){
            if($values[$ke]["flights"][$x]["bookref"] && $values[$ke]["flights"][$x]["bookref"] === $bookref){
                if($values[$ke]["flights"][$x]["flightDate"] && $values[$ke]["flights"][$x]["flightDate"] === $date){
                    $flight_departs = false; 
                    $flight_arrives = false; 
                    $values[$ke]["flights"][$x]["outboundAirportAbr"] = $post_data[0]["departure"]["airport"]["iata"];
                    $values[$ke]["flights"][$x]["inboundAirportAbr"] = $post_data[0]["arrival"]["airport"]["iata"];
                    $values[$ke]["flights"][$x]["duration"] = strval(-((strtotime($post_data[0]["departure"]["scheduledTimeLocal"]) - strtotime($post_data[0]["arrival"]["scheduledTimeLocal"]))/60)) . " mins";

                    if($values[$ke]["flights"][$x]["departure"] ){
                        $flight_departs = true;
                        $dep_time = str_replace(" ", "T",substr($post_data[0]["departure"]["scheduledTimeLocal"], 0,16));
                        echo("   departure :    " . $dep_time . "       expected departure : " . str_replace(" ", "T",substr($post_data[0]["departure"]["actualTimeLocal"], 0,16)) . "               new " );
                        $values[$ke]["flights"][$x]["departure"]["dep_time"] = $dep_time;
                        $values[$ke]["flights"][$x]["departure"]["dep_estimated"] = $post_data[0]["departure"]["actualTimeLocal"] ? str_replace(" ", "T",substr($post_data[0]["departure"]["actualTimeLocal"], 0,16)) : $dep_time;
                        $values[$ke]["flights"][$x]["departure"]["dep_terminal"] = $post_data[0]["departure"]["terminal"];
                        $values[$ke]["flights"][$x]["departure"]["dep_name"] = $post_data[0]["departure"]["airport"]["name"];
                        $values[$ke]["flights"][$x]["departure"]["dep_gate"] = $post_data[0]["departure"]["gate"];
                    }
                    
                    if($values[$ke]["flights"][$x]["arrival"]){
                        $flight_arrives = true;
                        $arr_time = str_replace(" ", "T",substr($post_data[0]["arrival"]["scheduledTimeLocal"], 0,16));
                        echo(" arrival   :    " . $arr_time);
                        $values[$ke]["flights"][$x]["arrival"]["arr_time"] = $arr_time;
                        $values[$ke]["flights"][$x]["arrival"]["arr_estimated"] = $post_data[0]["arrival"]["actualTimeLocal"] ? str_replace(" ", "T",substr($post_data[0]["arrival"]["actualTimeLocal"], 0,16)) : $arr_time;
                        $values[$ke]["flights"][$x]["arrival"]["arr_terminal"] = $post_data[0]["arrival"]["terminal"];
                        $values[$ke]["flights"][$x]["arrival"]["status"] = $post_data[0]["status"];
                        $values[$ke]["flights"][$x]["arrival"]["arr_name"] = $post_data[0]["arrival"]["airport"]["name"];

                    }
                    
                    if(!$flight_departs){
                        $dep_time = str_replace(" ", "T",substr($post_data[0]["departure"]["scheduledTimeLocal"], 0,16));
                        echo($dep_time);
                        $values[$ke]["flights"][$x]["departure"] = (object) array("dep_time" => $dep_time, "dep_estimated" => $post_data[0]["departure"]["actualTimeLocal"] ? str_replace(" ", "T",substr($post_data[0]["departure"]["actualTimeLocal"], 0,16)) : $dep_time, "dep_terminal" => $post_data[0]["departure"]["terminal"], "dep_gate" => $post_data[0]["departure"]["gate"], "dep_name" => $post_data[0]["departure"]["airport"]["name"]);
                    }
                    if(!$flight_arrives){
                        $arr_time = str_replace(" ", "T",substr($post_data[0]["arrival"]["scheduledTimeLocal"], 0,16));
                        
                        $values[$ke]["flights"][$x]["arrival"] = (object) array("arr_time" => $arr_time, "arr_estimated" => $post_data[0]["arrival"]["actualTimeLocal"] ? str_replace(" ", "T",substr($post_data[0]["arrival"]["actualTimeLocal"], 0,16)) : $arr_time, "arr_terminal" => $post_data[0]["arrival"]["terminal"], "status" => $post_data[0]["status"], "arr_name" => $post_data[0]["arrival"]["airport"]["name"]);
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
        $data2[$ke] = $wpdb->query($sql);
    }

    return [$data2, $post_data];
    //return [$post_data, $bookref, $date, $values, $data2];
}

function practice($id, $json_from_file){
    global $wpdb;
    $flight_data_json_file = $json_from_file;
    $info =  ['section_id' => 2, 'itinerary_id' => $id ];
    $data = get_all_section_values($info);
    $data = json_decode($data->data->value,true)["flights"];
    foreach($data as $key => $val){
        if ($val["bookref"] && $val["flightDate"]){
            //echo("booo , ", $val["bookref"], $val["flightDate"] );
            if(strtotime($val["flightDate"]) <= (time() + 24*60*60*2) && strtotime($val["flightDate"]) >= (time() - 24*60*60*1)){
                $temp = get_flight_data($val["bookref"], $val["flightDate"], $flight_data_json_file);
                $list_of_updates[$key] = $temp[1];
                $flight_data_json_file = $temp[0];
            }
        }
    }
    foreach($list_of_updates as $k => $v){
        if ($v){
            $flight_departs = false; 
            $flight_arrives = false; 
            if($data[$k]["departure"]){
                $flight_departs = true;
                $data[$k]["departure"]["dep_time"] = $list_of_updates[$k]["dep_time"];
                $data[$k]["departure"]["dep_estimated"] = $list_of_updates[$k]["dep_estimated"] ? str_replace(" ", "T", $list_of_updates[$k]["dep_estimated"]) : str_replace(" ", "T", $list_of_updates[$k]["dep_time"]);
                $data[$k]["departure"]["dep_terminal"] = $list_of_updates[$k]["dep_terminal"];
                $data[$k]["departure"]["dep_gate"] = $list_of_updates[$k]["dep_gate"];
                $data[$k]["departure"]["dep_delayed"] = $list_of_updates[$k]["dep_delayed"];
            }
            if($data[$k]["arrival"]){
                $flight_arrives = true;
                $data[$k]["arrival"]["arr_time"] = $list_of_updates[$k]["arr_time"];
                $data[$k]["arrival"]["arr_estimated"] = $list_of_updates[$k]["arr_estimated"] ? str_replace(" ", "T", $list_of_updates[$k]["arr_estimated"]) : str_replace(" ", "T", $list_of_updates[$k]["arr_time"]);
                $data[$k]["arrival"]["arr_terminal"] = $list_of_updates[$k]["arr_terminal"];
                $data[$k]["arrival"]["arr_gate"] = $list_of_updates[$k]["arr_gate"];
                $data[$k]["arrival"]["arr_delayed"] = $list_of_updates[$k]["arr_delayed"];
                $data[$k]["arrival"]["status"] = $list_of_updates[$k]["status"];
            }
            if(!$flight_departs){
                $data[$k]["departure"] = (object) array("dep_time" => $list_of_updates[$k]["dep_time"],
                "dep_estimated" => $list_of_updates[$k]["dep_estimated"] ? str_replace(" ", "T", $list_of_updates[$k]["dep_estimated"]) : str_replace(" ", "T", $list_of_updates[$k]["dep_time"]),
                "dep_terminal" => $list_of_updates[$k]["dep_terminal"], "dep_gate" => $list_of_updates[$k]["dep_gate"]);
            }
            if(!$flight_arrives){
                $data[$k]["arrival"] = (object) array( "arr_time" => str_replace(" ", "T", $list_of_updates[$k]["arr_time"]),
                "arr_estimated" =>$list_of_updates[$k]["arr_estimated"] ? str_replace(" ", "T", $list_of_updates[$k]["arr_estimated"]) : str_replace(" ", "T", $list_of_updates[$k]["arr_time"]), 
                "arr_terminal" => $list_of_updates[$k]["arr_terminal"], "arr_gate" => $list_of_updates[$k]["arr_gate"], "status" => $list_of_updates[$k]["status"]);
            }
        }
    };
    
    $value = (object)array("section_id" => $info["section_id"], "itinerary_id"=>$info["itinerary_id"], "value" => ["flight"=>$data]);
    $x = get_section_value($info["section_id"],$info["itinerary_id"]);
    $val = json_encode(["flights"=>$data]);
    $sql = "UPDATE wp_itinerary_values SET value = %s  WHERE id = '{$x[0]->id}'";
    $sql = $wpdb->prepare($sql,  $val);
    $data2 = ['updated' => $wpdb->query($sql)];
    return [$flight_data_json_file, $data2, $val];
};

function update_flight_data($flight_info)
{
    global $wpdb;

    try {
        $flight_data_file = file_get_contents(__DIR__ ."/flight_data_all.json");
            if ($flight_data_file) { 
            echo("got here 2");
            $flight_data_json_file = json_decode($flight_data_file, true);
            if (isset($flight_data_json_file["update_time"])) {
                if (($flight_data_json_file["update_time"] + 60*5) >= time()) {
                    return("updated in the last 5 mins");
                }
            }
        }
    }
    catch(Exception $e) {
        //echo($e);
    }
    
    $results = $wpdb->get_results("SELECT * FROM {$wpdb->prefix}itineraries", OBJECT);
    $x = [];
    $z = 0;
    foreach($results as $key => $val){
        $z++;
        $y = practice($val->id, $flight_data_json_file);
        $flight_data_json_file = $y[0];
        $x[] = [$val->id, $y[1], $y[2]];   
    }
    try {
        
        if ($flight_data_json_file) { 
            $flight_data_json_file["update_time"] = time();
            file_put_contents(__DIR__ . "/flight_data_all.json", json_encode($flight_data_json_file));

        }
    }    
    catch(Exception $e) {
        //echo($e);
    }
    return [$x, $z]; 
}

function get_flight_data($plane_iata, $departure_date_time_utc, $x) {

    if(strtotime($departure_date_time_utc) <= time() - (24*60*60)) {
        return (null);
    }
    $flight_data_json_file = $x;
    $plane_iata = strtoupper($plane_iata);
    $def_name_for_file = $plane_iata . ' ' . $departure_date_time_utc;
    /*
    try {
        $flight_data_file = file_get_contents("flight_data_all.json");
        if ($flight_data_file) {
            $flight_data_json_file = json_decode($flight_data_file, true);
            if (isset($flight_data_json_file[$def_name_for_file])) {
                $flight_data_from_file = $flight_data_json_file[$def_name_for_file];
                if (($flight_data_from_file['data_last_requested_stored'] + 60*5) >= time()) {
                    return($flight_data_from_file);
                }
            }
        }
    }
    catch(Exception $e) {
        //echo($e);
    }
    */

    try {
        if (isset($flight_data_json_file[$def_name_for_file])) {
            $flight_data_from_file = $flight_data_json_file[$def_name_for_file];
            if (($flight_data_from_file['data_last_requested_stored'] + 60*5) >= time()) {
                return([$flight_data_json_file, $flight_data_from_file]);
            }
        }
    }
    catch(Exception $e) {
        //echo($e);
    }
    


    $base_url = 'https://airlabs.co/api/v9';
    $api_key = 'ec0f3933-3b4f-4234-a431-00c6b81a12eb';

    
    $raw_flight_data = get_raw_flight_data($plane_iata, $api_key, $base_url);

    if (isset(json_decode($raw_flight_data, true)['response'])) {
        $flight_data = json_decode($raw_flight_data, true)['response'];
        //return $flight_data;
        if (substr($flight_data['dep_time_utc'],0,10) === $departure_date_time_utc) {
            //echo("<div>" .  substr($flight_data['dep_time_utc'],0,10) . " , " . $departure_date_time_utc . "</div>"); 
            

          //$raw_delayed_depart_data = get_raw_delayed_depart_data($plane_iata, $api_key, $base_url);
        /*
          if (isset(json_decode($raw_delayed_depart_data, true)['response'])) {
            $delayed_depart_data = json_decode($raw_delayed_depart_data, true)['response'];
            $raw_delayed_arrival_data = get_raw_delayed_depart_data($plane_iata, $api_key, $base_url);
            if (isset(json_decode($raw_delayed_arrival_data, true)['response'])) {
                $delayed_arrival_data = json_decode($raw_delayed_arrival_data, true)['response'];
                $flight_data['delayed_arrival_data'] = $delayed_arrival_data;
            }
            $flight_data['delayed_depart_data'] = $delayed_depart_data;
        }
        */
        
        $flight_data['data_last_requested_stored'] = time();

        $flight_data_json_file[$def_name_for_file] = $flight_data;

        //file_put_contents(__DIR__ . "/flight_data_all.json", json_encode($flight_data_json_file));
        return([$flight_data_json_file, $flight_data]);  
        }
        return(null);
    }
}

function get_raw_flight_data($plane_iata, $api_key, $base_url) {
    $curl = curl_init();

    curl_setopt_array($curl, array(
      CURLOPT_URL => $base_url . '/flight?api_key=' . $api_key . '&flight_iata=' . $plane_iata,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_ENCODING => '',
      CURLOPT_MAXREDIRS => 10,
      CURLOPT_TIMEOUT => 0,
      CURLOPT_FOLLOWLOCATION => true,
      CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
      CURLOPT_CUSTOMREQUEST => 'GET',
    ));
    
    $raw_flight_data = curl_exec($curl);
    
    curl_close($curl);
    //echo $response; 
    return ($raw_flight_data);
}

function get_raw_delayed_depart_data($plane_iata, $api_key, $base_url) {
    $curl = curl_init();

    curl_setopt_array($curl, array(
        CURLOPT_URL => $base_url . '/delays?delay=30&type=departures&api_key=' . $api_key . '&flight_iata=' . $plane_iata,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'GET',
    ));

    $raw_delayed_depart_data = curl_exec($curl);

    curl_close($curl);
    
    return ($raw_delayed_depart_data);
}

function get_raw_delayed_arrival_data($plane_iata, $api_key, $base_url) {
    $curl = curl_init();

    curl_setopt_array($curl, array(
        CURLOPT_URL => $base_url . '/delays?delay=30&type=arrivals&api_key=' . $api_key . '&flight_iata=' . $plane_iata,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_ENCODING => '',
        CURLOPT_MAXREDIRS => 10,
        CURLOPT_TIMEOUT => 0,
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
        CURLOPT_CUSTOMREQUEST => 'GET',
    ));

    $raw_delayed_arrival_data = curl_exec($curl);

    curl_close($curl);
    
    return ($raw_delayed_arrival_data);
}