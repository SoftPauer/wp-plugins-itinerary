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
    global $wpdb, $table_name_invite_tokens;
    $token = $data["access_token"];
    $token_result = $wpdb->get_results("SELECT subscriber_id FROM $table_name_invite_tokens WHERE invitation_token = '{$token}'");
    $user_result = get_user_by('id', $token_result[0]->subscriber_id);
    return $user_result;
}

function create_users_by_email(WP_REST_Request $request)
{
    $resp = [];
    $users = $request["users"];
    foreach ($users as $user) {
        $userExists = get_user_by('email', $user["email"]);
        if ($userExists == false) {
            $userLogin = "";
            if (in_array("user_login", $user)) {
                $userLogin = $user["user_login"];
            } else {
                $userLogin = substr($user["email"], 0, strpos($user["email"], '@'));
            }
            $userdata = array(
                'user_login' => $userLogin,
                'user_email' => $user["email"],
                'user_pass' => password_generate(10),
            );
            $userId = wp_insert_user($userdata);
            if (gettype($userId) == "object") {
                array_push($resp, ActionResponse::createError($userId->get_error_message(), "create_users_by_email", $user["email"]));
                continue;
            }
            $data = array("email" => $user["email"], "type" => "subscriber");
            array_push($resp,send_mail($data));
        } else {
            array_push($resp, ActionResponse::createError("Email already exists", "create_users_by_email", $user["email"]));
        }
    }
    return rest_ensure_response($resp);
}

function password_generate($chars)
{
    $data = '1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz';
    return substr(str_shuffle($data), 0, $chars);
}