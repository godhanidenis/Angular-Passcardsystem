<?php


$post_data = file_get_contents("php://input");
$data = json_decode($post_data);

// $pushid=$data->push_id;

$name=$_POST['name'];
$phone=$_POST['phone'];
$email=$_POST['email'];
$passport=$_POST['id_passport_number'];
$vehicle=$_POST['vehicle_number'];
$address=$_POST['address'];
$number_of_resident=$_POST['number_of_resident'];
$passcode=$_POST['passcode'];
$location=$_POST['location'];

echo $pushid;

$subject = 'ACCESSONE - YOUR RESIDENT APP ACCESS CODE';
$userEmailTo = 'salvagoar@gmail.com';

$headers = "From: accessone@securityonegroup.mu\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";



$message = '<html><body style="text-align: center; padding: 30px; font-weight: 100;">';
$message .= '<h3>ACCESSONE - YOUR RESIDENT APP ACCESS REGISTRATION REQUEST</h3>';
$message .= '<img style="width: 220px; margin: 30px auto;" src="https://vms.s-onedigital.com/img/accessone-black-nobackgound-x.png" alt="Logo" />';
$message .= "<div style='text-align: left;'><h3>DEAR ".$name.",</h3><br/><br/>";


$message .= "<h3>A new resident is looking to register through the app.</h3><br/><br/>";
$message .= "Registration details :<br/>";
$message .= "<p>Resident name : ".$name."</p>";
$message .= "<p>Resident phone : ".$phone."</p>";
$message .= "<p>Resident email : ".$email."</p>";
$message .= "<p>Passport / ID Number : ".$passport."</p>";
$message .= "<p>Vehicle number/s : ".$vehicle."</p>";
$message .= "<p>Address : ".$address."</p>";
$message .= "<p>Number of residents : ".$number_of_resident."</p>";
$message .= "<p>Passcode : ".$passcode."</p>";
$message .= "<p>Location : ".$location."</p>";
$message .= "<p>Best regards,</p>";
$message .= "<p>Accessone Team</p>";
$message .= "<p>By Security One</p></div>";
$message .= "</body></html>";

mail($userEmailTo, $subject, $message, $headers);

echo $message;


?>