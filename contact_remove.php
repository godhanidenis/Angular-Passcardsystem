<?php


$post_data = file_get_contents("php://input");
$data = json_decode($post_data);

$name=$data->name;
$email=$data->email;



$subject = 'ACCESSONE - NOTIFICATION';

$headers = "From: accessone@securityonegroup.mu\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=utf-8\r\n";



$message = '<html><body style="text-align: center; padding: 30px; font-weight: 100;">';

$message .= '<img style="width: 220px; margin: 30px auto;" src="https://vms.s-onedigital.com/img/accessone-black-nobackgound-x.png" alt="Logo" />';
$message .= '<h3>ACCESSONE - YOUR RESIDENT APP / VOTRE APP RÉSIDENT</h3>';

$message .= "<div style='text-align: left;'><h3>DEAR / CHER ".$name.",</h3><br/><br/>";


$message .= "<h3>Thank you for using Accessone, your premiere security access provider.<br><br>Your Account has been removed / Merci d'utiliser Accessone, votre principal fournisseur d'accès de sécurité. <br> <br> Votre compte a été supprimé</h3><br/><br/>";

$message .= "<p>Best regards / Meilleures salutations,</p>";
$message .= "<p>Accessone Team / Équipe Accessone</p>";
$message .= "<p>By / Par Security One</p></div>";
$message .= "</body></html>";

mail($email, $subject, $message, $headers);


?>