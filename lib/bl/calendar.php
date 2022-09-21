<?php

function getIcalDate($time, $timeZone, $inclTime = true)
{
  $eventTime = strtotime($time);
  if ($timeZone) {
    $timeZonesStr = file_get_contents(plugin_dir_url(__FILE__) . "admin_frontend/src/assets/timezones.json");
    $timeZones = json_decode($timeZonesStr, true);
    $timeZoneKey = array_search($timeZone, array_column($timeZones, 'text'));
    $timeZoneObj = $timeZones[$timeZoneKey];
    $timeZoneObj['offset'] = $timeZoneObj['offset'] * -1;
    $eventTime = strtotime("{$timeZoneObj['offset']} hours", $eventTime);
  } else {
    $ukTimeZone = new DateTimeZone("Europe/London");
    $datetime_UTC = date_create("now", timezone_open("Etc/GMT"));
    $offset = timezone_offset_get($ukTimeZone, $datetime_UTC) / 3600;
    $eventTime = strtotime("{$offset} hours", $eventTime);
  }
  return date('Ymd' . ($inclTime ? '\THis' : ''), $eventTime) . "Z";
}

//Ical
function get_ical_for_user(WP_REST_Request $request)
{
  global $wpdb, $table_name_itinerary_data;

  //for not its just an id
  $userToken = $request['usertoken'];

  $user = get_user_by('id', $userToken);
  $display_name = $user->display_name;
  //get last 3 itineraries 

  $raceMap = get_race_map();
  $lastRacesIds = array_map(
    fn ($race) =>
    $race['race_id'],
    array_slice($raceMap, -3, 3, true)
  );
  $stringRaceIds = implode(',', $lastRacesIds);
  $lastItins = $wpdb->get_results("SELECT * FROM $table_name_itinerary_data WHERE id in ( $stringRaceIds )");
  $lastItinsJson = array_map(fn ($itin) => json_decode($itin->json_data), $lastItins);
  // echo $lastItinsJson;
  //find all flight events 
  $flights = array_map(fn ($itin) => $itin->flights->Flight, $lastItinsJson);

  $flightsForTheUser = [];
  foreach ($flights as $flight) {
    foreach ($flight as $flightItem) {
      if (in_array($display_name, $flightItem->passengers)) {
        array_push($flightsForTheUser, $flightItem);
      }
    }
  }
  $eventsForTheFlights = [];
  foreach ($flightsForTheUser as $flight) {
    foreach ($flight->events as $event) {
      if (in_array($display_name, $event->appliesFor)) {
        array_push($eventsForTheFlights, $event);
      }
    }
  }

  $ical = "BEGIN:VCALENDAR
PRODID:-//Google Inc//Google Calendar 70.9054//EN
VERSION:2.0
CALSCALE:GREGORIAN
METHOD:PUBLISH
X-WR-CALNAME:Eventr Calendar
X-WR-TIMEZONE:UTC
X-WR-CALDESC:Eventr Calendar
";
  foreach ($eventsForTheFlights as $event) {
    $ical .= "BEGIN:VEVENT
DTSTART:" . getIcalDate($event->time, $event->timezone) . "
DTEND:" . getIcalDate($event->time, $event->timezone) . "
DTSTAMP:" . date('Ymd' . '\THis', time()) . "Z
UID:" . str_replace(" ", "_", $event->time . $event->description) . "
SUMMARY:" . $event->description . "
STATUS:CONFIRMED
DESCRIPTION:" . $event->description . "
END:VEVENT
";
  }
  $ical .= "END:VCALENDAR";
  //set correct content-type-header
  header('Content-type: text/calendar; charset=utf-8');
  header('Content-Disposition: inline; filename=calendar.ics');
  //  echo  json_encode(   $flights);
  echo    $ical;
}