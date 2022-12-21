<?php
require_once __DIR__ . '/../common.php';

function send_mail($data)
{
    global $wpdb, $table_name_users, $table_name_invite_tokens;

    $email = $data['email'];
    $type = $data['type'];

    $users_result = get_user_by("email", $email);
    $myuuid = guidv4();

    $subject = "";
    $message = "";
    switch ($type) {
        case "manager":
            list($message, $subject) = manager_invite_email($myuuid);
            break;
        case "subscriber":
            list($message, $subject) = subscriber_invite_email($myuuid);
            break;
        default:
            list($message, $subject) = null;
    }
    if ($message != null && $subject != null && $users_result !== false) {
        $wpdb->insert(
            $table_name_invite_tokens,
            array(
                'subscriber_id' => $users_result->ID,
                'invitation_token' => $myuuid,
                'time_created' => current_time('mysql'),
                'accepted' => "pending",
            ),
            array(
                '%d',
                '%s',
                '%s',
                '%s',
            )
        );
        //what do i need, "to" "subject"
        if ($email && $subject && $message) {
            $headers = array('Content-Type: text/html; charset=UTF-8');
            $attachments = [];
            $sent = wp_mail($email, $subject, $message, $headers, $attachments);
            if ($sent) {
                return ActionResponse::createSuccess("Mail sent successfully ", $email);
            } else {
                return ActionResponse::createError("Mail send failed", "send_mail", $email);
            }
        } else {
            return ActionResponse::createError("For mail to be sent the following fields are required : to , subject, message", "send_mail", $email);
        }
    } else {
        return ActionResponse::createError("Message type wasn't selected properly", "send_mail", $data['email']);
    }
}
;

add_filter('cron_schedules', 'add_cron_interval');
function add_cron_interval($schedules)
{
    $schedules['thirty_minutes'] = array(
        'interval' => 1800,
        'display' => esc_html__('30 minutes'),
    );
    return $schedules;
}
add_action('delete_invite_hook', 'delete_invite_cron_exec');

function delete_invite_cron_exec()
{
    //TODO replace WP cron with real CronJobs
    //TODO compare Date time if its 24 hours in the past then delete
    global $wpdb, $table_name_invite_tokens;
    error_log("Cron Run");
    $wpdb->query("DELETE FROM $table_name_invite_tokens WHERE STR_TO_DATE(time_created, '%Y-%m-%dT%H:%i:%s') < NOW()");
    // $wpdb->delete($table_name_invite_tokens, ["date_created"<=DATE_SUB(NOW(), INTERVAL 1 DAY)],[%s]);
}

if (!wp_next_scheduled('delete_invite_hook')) {
    wp_schedule_event(time(), 'thirty_minutes', 'delete_invite_hook');
}

function guidv4($data = null)
{
    // Generate 16 bytes (128 bits) of random data or use the data passed into the function.
    $data = $data ?? random_bytes(16);
    assert(strlen($data) == 16);

    // Set version to 0100
    $data[6] = chr(ord($data[6]) & 0x0f | 0x40);
    // Set bits 6-7 to 10
    $data[8] = chr(ord($data[8]) & 0x3f | 0x80);

    // Output the 36 character UUID.
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

function subscriber_invite_email($token)
{
    //TODO subscriber email template
    $staffHost = "https://" . getenv("STAFF_HOST");
  $currentUser = wp_get_current_user();
  $invitingUserFirstName = $currentUser->user_firstname;
  $invitingUserSecondName = $currentUser->user_lastname;


    $subject = "Eventr Invite Email";
    $message = "
    <body>
    <table
      style='
        width: 100%;
        display: flex;
        justify-content: center;
        table-layout: fixed;
      '
    >
      <tbody style='text-align: center'>
        <tr style='display: flex; justify-content: center'>
          <td style='display: flex; justify-content: center; width: 100%'>
            <img
              src='https://eventr.bwtsoftpauer.com/email-images/Header.png'
              alt='You have been invited to Eventr teams!'
              style='width: 100%'
            />
          </td>
        </tr>
        <tr style='display: flex; justify-content: center'>
          <td style='display: flex; justify-content: center; width: 100%'>
            <table style='text-align: center; width: 100%'>
              <tr>
                <td>
                  <p style='font-size: 1.2rem'>Hi,</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p style='font-size: 1.2rem'>
                    You've been invited to
                    <b> an event </b> by
                    <b> $invitingUserFirstName $invitingUserSecondName.</b>
                  </p>
                </td>
              </tr>
              <tr>
                <td>
                  <p style='font-size: 1.2rem'>Here's your unique login link:</p>
                </td>
              </tr>
              <tr>
                <td>
                  <p style='font-size: 1.2rem'>
                    <a href='$staffHost/emaillogin/?access_token=" . $token . "'><b>HERE </b></a> 
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr style='display: flex; width: 100%'>
          <td style='display: flex; width: 100%'>
            <table
              style='
                text-align: center;
                background-color: #f0f5fe;
                border-radius: 20px;
                padding: 10px;
                width: 100%;
              '
            >
              <tr>
                <td><h2 style='font-size: 2.5rem'>How to get started</h2></td>
              </tr>
              <tr>
                <td>
                  <p style='font-size: 1.2rem; padding-bottom: 30px'>
                    We can’t wait to start helping you manage your events, but
                    first, here are a few helpful tips so you can get started
                    using Eventr Team.
                  </p>
                </td>
              </tr>
              <tr style='display:block; width: 100%'>
                <td
                  style='
                  display: inline-block;
                  width: 30%;
                  min-width: 300px;
                  margin: 50px 5% 50px 5%;
                  '
                >
                  <div
                    style='
                      height: 300px;
                      width: 100%;
                      display: flex;
                      align-items: center;
                      background-image: url(https://eventr.bwtsoftpauer.com/email-images/activate.png);
                      background-repeat: no-repeat;
                      background-size: contain;
                      background-position: center;
                    '
                  ></div>
                </td>
                <td style='display: inline-block;
                width: 30%;
                min-width: 300px;'>
                  <table
                    style='
                      display: flex;
                      justify-content: left;
                      vertical-align: top;
                      height: 100%;
                      width: 100%;
                      min-width: 300px;
                      max-width: 500px;
                    '
                  >
                    <tr style='width: 100%'>
                      <td
                        style='
                          font-style: normal;
                          font-weight: 800;
                          font-size: 60px;
                          vertical-align: top;
                          padding: 0 20px;
                        '
                        rowspan='3 '
                      >
                        1
                      </td>
                      <td style='display: flex; width: 100%; text-align: left'>
                        <h2 style='font-size: 2rem; margin: 0'>
                          Activate Your Account
                        </h2>
                      </td>
                    </tr>
                    <tr style='width: 100%'>
                      <td>
                        <p
                          style='
                            text-align: left;
                            margin: none;
                            font-size: 1.2rem;
                          '
                        >
                          The first step is to activate your account using your
                          unique login code. This will give you access to your
                          team and events.
                        </p>
                      </td>
                    </tr>
                    <tr style='width: 100%'>
                      <td style='display: flex; width: 100%'>
                        <a
                          href='asdf'
                          style='
                            background-color: #18b1ab;
                            color: white;
                            border-radius: 15px;
                            padding: 10px;
                            min-width: 200px;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                          '
                        >
                          <h3 style='font-size: 1.5rem; margin: 0'>
                            Activate your account
                          </h3>
                        </a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr style='padding: 10px 0 10px 0'>
                <td
                  style='
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    overflow-wrap: normal;
                    overflow: hidden;
                    flex-wrap: wrap;
                  '
                >
                  <div
                    style='
                      height: 300px;
                      width: 30%;
                      min-width: 300px;
                      margin: 50px 5% 50px 5%;
                      display: flex;
                      align-items: center;
                      background-image: url(https://eventr.bwtsoftpauer.com/email-images/details.png);
                      background-repeat: no-repeat;
                      background-size: contain;
                      background-position: center;
                    '
                  ></div>
                  <table
                    style='
                      display: flex;
                      justify-content: left;
                      vertical-align: top;
                      height: 100%;
                      width: 100%;
                      min-width: 300px;
                      max-width: 500px;
                    '
                  >
                    <tr>
                      <td
                        rowspan='2'
                        style='
                          font-style: normal;
                          font-weight: 800;
                          font-size: 60px;
                          vertical-align: top;
                          padding: 0 20px;
                        '
                      >
                        2
                      </td>
                      <td
                        style='
                          display: flex;
                          width: 100%;
                          text-align: left;
                          margin-top: none;
                        '
                      >
                        <h2 style='font-size: 2rem; margin: 0'>
                          Update Your Details
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td>
                        <p
                          style='
                            text-align: left;
                            margin: none;
                            font-size: 1.2rem;
                          '
                        >
                          The second step is to update your details. Choose your
                          own username and password for added personalisation and
                          security.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td
                  style='
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 100%;
                    overflow-wrap: normal;
                    overflow: hidden;
                    flex-wrap: wrap;
                  '
                >
                  <div
                    style='
                      height: 300px;
                      width: 30%;
                      min-width: 300px;
                      margin: 50px 5% 50px 5%;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      background-image: url(https://eventr.bwtsoftpauer.com/email-images/phone.png);
                      background-repeat: no-repeat;
                      background-size: contain;
                      background-position: center;
                    '
                  ></div>
                  <table
                    style='
                      display: flex;
                      justify-content: left;
                      vertical-align: top;
                      height: 100%;
                      width: 100%;
                      min-width: 300px;
                      max-width: 500px;
                    '
                  >
                    <tr>
                      <td
                        rowspan='3'
                        style='
                          font-style: normal;
                          font-weight: 800;
                          font-size: 60px;
                          vertical-align: top;
                          padding: 0 20px;
                        '
                      >
                        3
                      </td>
                      <td colspan='2' style='text-align: left'>
                        <h2 style='font-size: 2rem; margin: 0'>
                          Download the Eventr Teams App
                        </h2>
                      </td>
                    </tr>
                    <tr>
                      <td colspan='2'>
                        <p style='text-align: left; font-size: 1.2rem'>
                          The third step is to download the Eventr Teams app. You
                          can find us on the App Store or Google Play.
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style='width: 50%'>App store image</td>
                      <td style='width: 50%'>Play store image</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr style='display: flex; justify-content: center'>
          <td style='width: 100%'>
            <p style='font-size: 1.2rem'>
              That’s all for now, we’re here if you get stuck or have any
              questions.
            </p>
          </td>
        </tr>
        <tr style='display: flex; justify-content: center'>
          <td style='width: 100%'>
            <p style='font-size: 1.2rem'>The Eventr team.</p>
          </td>
        </tr>
        <tr style='display: flex; justify-content: center'>
          <td style='display: flex; justify-content: center; width: 100%'>
            <img
              src='https://eventr.bwtsoftpauer.com/email-images/Footer.png'
              alt='Powered By Soft Pauer. Company number: 09227101. Registered in England and Wales.'
              style='width: 100%'
            />
          </td>
        </tr>
      </tbody>
    </table>
  </body>
  
    ";
    return array($message, $subject);
}

function manager_invite_email($token)
{
    //TODO manager email template
    return null;
}