<?php

// echo 'push visit';

$push_id = $_GET['push_id'];
$visitor = $_GET['visitor'];

        $content = array(
            "en" => 'Your visitor '.$visitor.' has arrived. / Votre visiteur '.$visitor.' est arrivé.'
            );
            
            $headings = array(
        "en" => 'AccessOne'
    );
        
        $fields = array(
            'app_id' => "c99959f9-87c0-470f-865c-71c32cd88d6c",
            'include_player_ids' => array($push_id),
            'data' => array("foo" => "bar"),
            "headings" => $headings,
            'contents' => $content
        );
        
        $fields = json_encode($fields);
        print("\nJSON sent:\n");
        print($fields);
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, "https://onesignal.com/api/v1/notifications");
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: application/json; charset=utf-8'));
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, TRUE);
        curl_setopt($ch, CURLOPT_HEADER, FALSE);
        curl_setopt($ch, CURLOPT_POST, TRUE);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $fields);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);

        $response = curl_exec($ch);
        curl_close($ch);
        

?>
