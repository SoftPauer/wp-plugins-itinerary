<?php

function get_section_by_name($name)
{
    global $wpdb, $table_name_sections;
    return $wpdb->get_row(
        $wpdb->prepare(
            "SELECT * FROM $table_name_sections WHERE name = %s",
            $name
        )
    );

}