<?php
// $post_data = file_get_contents("php://input");
// $data = json_decode($post_data);

$passcode=$_POST['message'];

$name=$_POST['name'];
$email=$_POST['email'];
$phone=$_POST['phone'];
$location=$_POST['location'];
$address=$_POST['address'];
$vehicle=$_POST['vehicle_number'];
$residents=$_POST['number_of_resident'];

$subject = 'ACCESSONE - REGISTRATION REQUEST';
// $userEmailTo = 'accessone@securityonegroup.mu';
$userEmailTo = 'salvagoar@gmail.com';

$headers = "From: accessone@securityonegroup.mu\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=utf-8\r\n";
$headers .= 'Cc: norman@webdg.net, thomas@webdg.net, salvagoar@gmail.com' . "\r\n";

$message = '<html><body style="text-align: center; padding: 30px; font-weight: 100;">';

$message .= '<img style="width: 220px; margin: 30px auto;" src="https://a1admin.kronosun.com/img/accessone-black-nobackgound-x.png" alt="Logo" />';
$message .= '<h3>ACCESSONE - YOUR RESIDENT APP ACCESS REGISTRATION REQUEST</h3>';

$message .= "<div style='text-align: left;'><h3>DEAR Admin,</h3><br/><br/>";


$message .= "<h3>A new resident is looking to register through the app.</h3><br/><br/>";
$message .= "Registration details :<br/>";
$message .= "<p>Location : ".$location."</p>";
$message .= "<p>Name: ".$name."</p>";
$message .= "<p>Phone: ".$phone."</p>";
$message .= "<p>Email: ".$email."</p>";
$message .= "<p>Address: ".$address."</p>";
$message .= "<p>Vehicle registered : ".$vehicle."</p>";
$message .= "<p>Number of residents : ".$residents."</p><br/><br/>";
$message .= "<p>Best regards,</p>";
$message .= "<p>Accessone Team</p>";
$message .= "<p>By Security One</p></div>";
$message .= "</body></html>";

mail($userEmailTo, $subject, $message, $headers);


?>