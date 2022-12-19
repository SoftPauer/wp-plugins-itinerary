<?php

function update_db()
{

    global $wpdb, $table_name_sections, $table_name_fields;
    $current = get_site_option('itinerary_db_version');
    if (version_compare($current, '1.1') < 0) {
        error_log("updating to v 1.1");
        $wpdb->query('START TRANSACTION');
        error_log("Reserving ids for SP managed sections");
        for ($i=0; $i < 1000; $i++) { 
            $wpdb->insert(
                $table_name_sections,
                array(
                    'time_created' => " ",
                    'time_updated' => " ",
                    'name' => " ",
                    'properties' => " ",
                ),
            );
        }
        $wpdb->query('ROLLBACK');
        update_option('itinerary_db_version', "1.1");
    }

    if (version_compare($current, '1.2') < 0) {
        error_log("updating to v 1.2");
        $wpdb->query('START TRANSACTION');
        error_log("Reserving ids for SP managed fields");
        for ($i=0; $i < 100000; $i++) { 
            $wpdb->insert(
                $table_name_fields,
                array(
                    'section' => "1",
                    'position' => "1",
                    'field_type'=> " ",
                    'field_name'=> " ",
                ),
            );
        }
        $wpdb->query('ROLLBACK');
        update_option('itinerary_db_version', "1.2");
    }

}