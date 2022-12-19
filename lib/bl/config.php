<?php

function get_all_config()
{
  $isWizardComplete = get_option('isWizardComplete');
  return rest_ensure_response(array('isWizardComplete' =>  boolval($isWizardComplete)));
}
