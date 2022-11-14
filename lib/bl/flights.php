<?php

function update_flight_data($flight_info)
{
    global $wpdb;
    $params = $flight_info->get_json_params();
    $plane_iata = $params['plane_iata'];
    $flight_date = $params['flight_date'];

    $res = get_flight_data($plane_iata);

    return $res;
}


function get_flight_data($plane_iata)
{

    try {
        $flight_data_file = file_get_contents("flight_data_all.json");
        if ($flight_data_file) {
            $flight_data_json_file = json_decode($flight_data_file, true);
            if (isset($flight_data_json_file[$plane_iata])) {
                $flight_data_from_file = $flight_data_json_file[$plane_iata];
                if (($flight_data_from_file['data_last_requested_stored'] + 60 * 5) >= time()) {
                    return ($flight_data_from_file);
                }
            }
        }
    } catch (Exception $e) {
        //echo($e);
    }





    $base_url = 'https://airlabs.co/api/v9';
    $api_key = 'ec0f3933-3b4f-4234-a431-00c6b81a12eb';

    $raw_flight_data = get_raw_flight_data($plane_iata, $api_key, $base_url);
    $raw_delayed_depart_data = get_raw_delayed_depart_data($plane_iata, $api_key, $base_url);
    $raw_delayed_arrival_data = get_raw_delayed_depart_data($plane_iata, $api_key, $base_url);


    if (isset(json_decode($raw_flight_data, true)['response'])) {
        $flight_data = json_decode($raw_flight_data, true)['response'];
        if (isset(json_decode($raw_delayed_depart_data, true)['response'])) {
            $delayed_depart_data = json_decode($raw_delayed_depart_data, true)['response'];
            if (isset(json_decode($raw_delayed_depart_data, true)['response'])) {
                $delayed_arrival_data = json_decode($raw_delayed_arrival_data, true)['response'];
                $flight_data['delayed_arrival_data'] = $delayed_arrival_data;
            }
            $flight_data['delayed_depart_data'] = $delayed_depart_data;
        }
        $flight_data['data_last_requested_stored'] = time();

        $flight_data_json_file[$plane_iata] = $flight_data;

        file_put_contents(__DIR__ . "/flight_data_all.json", json_encode($flight_data_json_file));
        return ($flight_data);
        //return('adsf');
    } else {
        return (null);
    }
}


function get_raw_flight_data($plane_iata, $api_key, $base_url)
{
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

function get_raw_delayed_depart_data($plane_iata, $api_key, $base_url)
{
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

function get_raw_delayed_arrival_data($plane_iata, $api_key, $base_url)
{
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
