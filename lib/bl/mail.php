<?php

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
            return $sent;
        } else {
            return "For mail to be sent the following fields are required : to , subject, message";
        }
    } else {
        return "Message type wasn't selected properly";
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

    $subject = "Eventr Invite Email";
    $message = "
         <html>
        <head>
        <meta http-equiv='Content-Type' content='text/html; charset=utf-8' />
            <title></title>
        </head>
        <body>
            <div class=e1728_19170>
                <div  className={styles.e1728_19171}></div>
                <div  className={styles.e1728_19172}></div>
                <div  className={styles.e1728_19173></div>
                <span  className={styles.e1728_19174>Hi User,<br> 
                        Congrats on becoming a member of the Eventr family! <br>
                        We cant wait to start helping you manage your teams, but first you need to set up your admin account.<br> 
                        Click the button below continue your journey.
                </span>
                <div  calssName={styles.e1728_19175}></div>
                <div  className={styles.e1728_19176}></div>
                <div className={styles.e1728_19177}>
                        <span  className={styles.e1728_19178}>Welcome to Eventr Team!</span>
                        <span  className={styles.e1728_19179}>You re one step closer to streamlining your events, for good.</span>
                </div>
                <div className={styles.e1728_19180}>
                    <span  className={styles.ei1728_19180_680_2414}>Create an account</span>
                </div>
                <div className={styles.e1728_19181}>
                    <div  className={styles.e1728_19182}></div>
                    <div  className={styles.e1728_19183}></div>
                </div>
                <a href='$staffHost/emaillogin/?access_token=" . $token . "'>HERE</a>
            </div>
        </body>
        </html>
    ";
    return array($message, $subject);
}

function manager_invite_email($token)
{
    //TODO manager email template
    return null;
}