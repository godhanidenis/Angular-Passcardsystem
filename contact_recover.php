<?php

$userEmailTo = $_GET['email'];
$phone = $_GET['[phone]'];


$string = file_get_contents("https://connect.s-onedigital.com/api/residentsbyemail/?email=".$userEmailTo."&phone=".$phone);
$json_a = json_decode($string, true);

$passcode = $json_a[0]['passcode'];

if($passcode != null) {

$subject = "ACCESSONE - YOUR RESIDENT APP ACCESS CODE / VOTRE CODE D'ACCÈS À L'APPLICATION RÉSIDENT";

$headers = "From: accessone@securityonegroup.mu\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=utf-8\r\n";

$message = '<html><body style="text-align: center; padding: 30px; font-weight: 100;">';

$message .= '<img style="width: 220px; margin: 30px auto;" src="https://vms.s-onedigital.com/img/accessone-black-nobackgound-x.png" alt="Logo" />';
$message .= '<h3>ACCESSONE - VOTRE CODE D\'ACCÈS À L\'APPLICATION RÉSIDENT</h3>';

$message .= "<div style='text-align: left;'><h3>DEAR / Cher ".$name.",</h3><br/><br/>";


$message .= "<h3>Thank you for registering with Accessone, your premiere security access provider / Merci de vous être inscrit auprès d'Accessone, votre principal fournisseur d'accès de sécurité.<br><br>Your Passcode is / Votre code d'accès est: ".$passcode."</h3><br/><br/>";
$message .= "<p>Best regards / Meilleures salutations,</p>";
$message .= "<p>Accessone Team / Équipe Accessone</p>";
$message .= "<p>By / Par Security One</p></div>";
$message .= "</body></html>";

mail($userEmailTo, $subject, $message, $headers);
}

?>