<?php


$post_data = file_get_contents("php://input");
$data = json_decode($post_data);

$name=$data->name;
$passcode=$data->passcode;
$email=$data->emailTo;



$subject = 'ACCESSONE - YOUR RESIDENT APP ACCESS CODE / ACCESSONE - VOTRE CODE D\'ACCÈS À L\'APPLICATION RÉSIDENT';
$userEmailTo=$data->emailTo;

$headers = "From: accessone@securityonegroup.mu\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=ISO-8859-1\r\n";



$message = '<html><body style="text-align: center; padding: 30px; font-weight: 100;">';
$message .= '<h3>ACCESSONE - YOUR RESIDENT APP ACCESS CODE / ACCESSONE - VOTRE CODE D\'ACCÈS À L\'APPLICATION RÉSIDENT</h3>';
$message .= '<img style="width: 220px; margin: 30px auto;" src="http://racss.kronosun.com/img/accessone-black-nobackgound.png" alt="Logo" />';
$message .= "<div style='text-align: left;'><h3>DEAR / CHER ".$name.",</h3><br/><br/>";

$message .= "<p>Your access code is / Votre code d'accès est: ".$passcode."<br/><br/>";

$message .= "<p>Best regards / Meilleures salutations,</p>";
$message .= "<p>Accessone Team / Équipe Accessone</p>";
$message .= "<p>By / Par Security One</p></div>";
$message .= "</body></html>";

mail($userEmailTo, $subject, $message, $headers);


?>