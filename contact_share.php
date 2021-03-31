<?php


$subject = "ACCESSONE - YOUR RESIDENT APP ACCESS PASS / VOTRE PASS D'ACCÈS À L'APPLICATION RÉSIDENT";
$userEmailTo=$_GET['email_to'];
$image = $_GET['image'];

$area = $_GET['area'];

$visitor = $_GET['visitor'];
$interval = $_GET['interval'];
$vehicles = $_GET['vehicles'];
$subscriber = $_GET['subscriber'];
$comment = $_GET['comment'];

$headers = "From: accessone@securityonegroup.mu\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=utf-8\r\n";



$message = '<html><body style="text-align: center; padding: 30px; font-weight: 100;">';

$message .= '<img style="width: 220px; margin: 30px auto;" src="https://vms.s-onedigital.com/img/accessone-black-nobackgound-x.png" alt="Logo" />';
$message .= '<h3>ACCESSONE - VOTRE CODE D\'ACCÈS À L\'APPLICATION RÉSIDENT</h3>';

// $message .= "<div style='text-align: left;'><h3>DEAR / Cher ".$name.",</h3><br/><br/>";


$message .= "<h3>Thank you for registering with Accessone, your premiere security access provider / Merci de vous être inscrit auprès d'Accessone, votre principal fournisseur d'accès de sécurité.<br><br>Your Area is / Votre area d'accès est: ".$area."</h3><br/><br/>";

$message .= "<img src='".$image."'/><br/><br/>";

$message .= "<div style='text-align: left;'><h3>DEAR / Cher ".$visitor.",</h3><br/><br/>";

$message .= "<p>Visitor ".$visitor."</p>";
$message .= "<p>Interval: ".$interval."</p>";
$message .= "<p>Vehicle/s: ".$vehicles."</p>";
$message .= "<p>Subscriber name: ".$subscriber."</p>";
$message .= "<p>Comment: ".$comment."</p>";

$message .= "<p>Best regards / Meilleures salutations,</p>";
$message .= "<p>Accessone Team / Équipe Accessone</p>";
$message .= "<p>By / Par Security One</p></div>";
$message .= "</body></html>";

mail($userEmailTo, $subject, $message, $headers);


?>