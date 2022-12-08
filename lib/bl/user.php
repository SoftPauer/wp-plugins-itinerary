<?php

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
        $users[] = (object)array("id" => $v->id, "firstName" => $firstName[0]->meta_value, "surname" => $surname[0]->meta_value, "department" => $department[0]->meta_value, "email" => $v->user_email, "userName" => $v->user_login);
    }
    return (object)array("users" => $users);
}
