<?php

function get_all_config()
{
    global $wpdb;
    $isWizardComplete = $wpdb->get_results("SELECT * FROM `wp_options` WHERE `option_name` = 'isWizardComplete'");
    $isWizardComplete = $isWizardComplete[0]??false;
  return rest_ensure_response(array('isWizardComplete' =>  $isWizardComplete));
}
