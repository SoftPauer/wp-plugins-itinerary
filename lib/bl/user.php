<?php
require __DIR__ . '/mail.php';
/**
 * Return all users
 */
//functions that returns all users for when we split the data. 
function get_all_users()
{
    global $wpdb;
    $users = [];
    $user_result = $wpdb->get_results("SELECT id, user_login, user_email  FROM {$wpdb->prefix}users", OBJECT);
    foreach ($user_result as $x => $v) {
        $firstName = $wpdb->get_results("SELECT meta_value FROM {$wpdb->prefix}usermeta where user_id = {intval($v->id)} and meta_key = 'first_name'", OBJECT);
        $surname = $wpdb->get_results("SELECT meta_value FROM {$wpdb->prefix}usermeta where user_id = {intval($v->id)} and meta_key ='last_name'", OBJECT);
        $department = $wpdb->get_results("SELECT meta_value FROM {$wpdb->prefix}usermeta where user_id = {intval($v->id)} and meta_key = 'department'", OBJECT);
        $users[] = (object) array("id" => $v->id, "firstName" => $firstName[0]->meta_value, "surname" => $surname[0]->meta_value, "department" => $department[0]->meta_value, "email" => $v->user_email, "userName" => $v->user_login);
    }
    return (object) array("users" => $users);
}

function get_user_by_token($data)
{
    global $wpdb, $table_name_invite_tokens, $table_name_users;
    $token = $data["access_token"];
    $token_result = $wpdb->get_results("SELECT subscriber_id FROM $table_name_invite_tokens WHERE invitation_token = '{$token}'");
    $user_result = $wpdb->get_results("SELECT * FROM $table_name_users WHERE id = '{$token_result[0]->subscriber_id}'");
    return $user_result[0];
}

function create_users_by_email(WP_REST_Request $request)
{
    global $wpdb, $table_name_users;
    $users = $request["users"];
    error_log("user " . json_encode($users));
    foreach ($users as $user) {
        $userExists = $wpdb->get_results("SELECT user_email FROM $table_name_users WHERE user_email = '{$user["email"]}'");
        if (count($userExists) === 0) {
            $userLogin = "";
            if ($user["user_login"] == null) {
                $userLogin = substr($user["email"], 0, strpos($user["email"], '@'));
            } else {
                $userLogin = $user["user_login"];
            }
            $password = password_generate(10);
            $hash = password_hash($password, PASSWORD_DEFAULT);
            $wpdb->insert(
                $table_name_users,
                array(
                    'user_login' => $userLogin,
                    'user_pass' => $hash,
                    'user_email' => $user["email"],
                    'user_registered' => current_time('mysql'),
                ),
                array(
                    '%s',
                    '%s',
                    '%s',
                    '%s',
                )
            );
            $data = array("email" => $user["email"], "type" => "subscriber");
            send_mail($data);
        } else {
            return "'{$user["email"]}' already exists";
        }

    }
}

function password_generate($chars)
{
    $data = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz';
    return substr(str_shuffle($data), 0, $chars);
}