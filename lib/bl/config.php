<?php

function get_all_config()
{
    global $wpdb;
    $isWizardComplete = $wpdb->get_results("SELECT * FROM `wp_options` WHERE `option_name` = 'isWizardComplete'");
  return rest_ensure_response(array('isWizardComplete' =>  $isWizardComplete));
}
