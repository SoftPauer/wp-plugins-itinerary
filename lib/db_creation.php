<?php
global $wpdb, $table_name_itinerary, $table_name_sections, $table_name_fields, $table_name_invite_tokens, $table_name_section_values, $table_name_itinerary_data, $table_name_costings, $table_name_itinerary_channels, $table_name_reporting;

$table_name_itinerary = $wpdb->prefix . 'itineraries';
$table_name_sections = $wpdb->prefix . 'itinerary_sections';
$table_name_fields = $wpdb->prefix . 'itinerary_fields';
$table_name_section_values = $wpdb->prefix . 'itinerary_values';
$table_name_itinerary_data = $wpdb->prefix . 'itinerary_data';
$table_name_itinerary_channels = $wpdb->prefix . 'itinerary_rocket_channels';
$table_name_reporting = $wpdb->prefix . 'itinerary_reporting';
$table_name_costings = $wpdb->prefix . 'itinerary_costings';
$table_name_invite_tokens = $wpdb->prefix . 'invite_tokens';
$table_name_users = $wpdb->prefix . 'users';

function itinerary_install()
{
  global $wpdb, $table_name_itinerary, $table_name_sections, $table_name_fields, $table_name_section_values, $table_name_itinerary_data, $table_name_itinerary_channels, $table_name_reporting, $table_name_costings, $table_name_invite_tokens;
  require_once(ABSPATH . 'wp-admin/includes/upgrade.php');

  $charset_collate = $wpdb->get_charset_collate();

  $sql = "CREATE TABLE $table_name_itinerary (
        id mediumint(9) NOT NULL AUTO_INCREMENT,
        time_created datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
        time_updated datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
        name tinytext NOT NULL,
        PRIMARY KEY  (id)
    ) $charset_collate;";
  dbDelta($sql);

  $sql = "CREATE TABLE $table_name_sections (
          id mediumint(9) NOT NULL AUTO_INCREMENT,
          time_created datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
          time_updated datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
          properties text,
          name tinytext NOT NULL,
          PRIMARY KEY  (id)
      ) $charset_collate;";
  dbDelta($sql);

  $sql = "CREATE TABLE $table_name_fields (
          id mediumint(9) NOT NULL AUTO_INCREMENT,
          section mediumint(9) NOT NULL,
          position mediumint(9) NOT NULL,
          field_type tinytext NOT NULL,
          field_name tinytext NOT NULL,
          parent mediumint(9),
          type_properties text,
          PRIMARY KEY  (id)
      ) $charset_collate;";
  dbDelta($sql);

  $sql = "CREATE TABLE $table_name_section_values (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    section mediumint(9)  NOT NULL,
    itinerary mediumint(9) NOT NULL,
    value text,
    PRIMARY KEY  (id)
  ) $charset_collate;";
  dbDelta($sql);

  $sql = "CREATE TABLE $table_name_itinerary_data (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    itinerary_id mediumint(9) NOT NULL,
    time_updated datetime DEFAULT '0000-00-00 00:00:00' NOT NULL,
    json_data text  NOT NULL,
    PRIMARY KEY  (id),
    FOREIGN KEY(itinerary_id) REFERENCES $table_name_itinerary(id)
  ) $charset_collate;";
  dbDelta($sql);


  $sql = "CREATE TABLE $table_name_itinerary_channels (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    itinerary_id mediumint(9) NOT NULL,
    section_id mediumint(9) NOT NULL,
    json_data text NOT NULL,
    channel_id text,
    PRIMARY KEY (id),
    FOREIGN KEY (itinerary_id) REFERENCES $table_name_itinerary (id),
    FOREIGN KEY (section_id) REFERENCES $table_name_sections (id)
  ) $charset_collate;";
  dbDelta($sql);

  $sql = "CREATE TABLE $table_name_reporting(
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    itinerary_id mediumint(9) NOT NULL,
    passenger text NOT NULL,
    summary text NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (itinerary_id) REFERENCES $table_name_itinerary (id)
  ) $charset_collate;";
  dbDelta($sql);

  $sql = "CREATE TABLE $table_name_costings (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    itinerary_id mediumint(9) NOT NULL,
    section_id mediumint(9) NOT NULL,
    listKey text NOT NULL,
    costing text,
    PRIMARY KEY (id),
    FOREIGN KEY (itinerary_id) REFERENCES $table_name_itinerary (id),
    FOREIGN KEY (section_id) REFERENCES $table_name_sections (id)
  ) $charset_collate;";
  dbDelta($sql);

  $sql = "CREATE TABLE $table_name_invite_tokens (
    id mediumint(9) NOT NULL AUTO_INCREMENT,
    subscriber_id bigint(20) unsigned NOT NULL ,
    invitation_token text NOT NULL, 
    accepted text NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (subscriber_id) REFERENCES wp_users(ID)
  ) $charset_collate;";
  dbDelta($sql);

  add_option('itinerary_db_version', "1.0");
}