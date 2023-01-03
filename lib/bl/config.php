<?php

function get_all_config()
{
  $isWizardComplete = get_option('isWizardComplete');
  $isPremium = get_option('isPremium');
  return rest_ensure_response(array('isWizardComplete' =>  boolval($isWizardComplete), 'isPremium' => boolval($isPremium)));
}
