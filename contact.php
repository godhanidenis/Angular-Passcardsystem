<?php


$post_data = file_get_contents("php://input");
$data = json_decode($post_data);


// $subject = $data->subject;
// $userEmailFrom="accessone@securityonegroup.mu";
// $userEmailTo=$data->emailTo;
$passcode=$data->message;

$name=$data->name;
$email=$data->email;
$phone=$data->phone;
$passport=$data->passport;
$location=$data->location;
$address=$data->address;
$vehicle=$data->vehicle;
$residents=$data->residents;

$subject = "ACCESSONE - YOUR RESIDENT APP ACCESS CODE / VOTRE CODE D'ACCÈS À L'APPLICATION RÉSIDENT";
$userEmailTo=$data->emailTo;

$headers = "From: accessone@securityonegroup.mu\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=utf-8\r\n";



$message = '<html><body style="text-align: center; padding: 30px; font-weight: 100;">';

$message .= '<img style="width: 220px; margin: 30px auto;" src="https://vms.s-onedigital.com/img/accessone-black-nobackgound-x.png" alt="Logo" />';
$message .= '<h3>ACCESSONE - VOTRE CODE D\'ACCÈS À L\'APPLICATION RÉSIDENT</h3>';

$message .= "<div style='text-align: left;'><h3>DEAR / Cher ".$name.",</h3><br/><br/>";


$message .= "<h3>Thank you for registering with Accessone, your premiere security access provider / Merci de vous être inscrit auprès d'Accessone, votre principal fournisseur d'accès de sécurité.<br><br>Your Passcode is / Votre code d'accès est: ".$passcode."</h3><br/><br/>";
$message .= "Your registration details / Vos détails d'inscription :<br/>";
$message .= "<p>Location / Emplacement: ".$location."</p>";
$message .= "<p>Name / Nom: ".$name."</p>";
$message .= "<p>Phone / Téléphone: ".$phone."</p>";
$message .= "<p>Email: ".$email."</p>";
$message .= "<p>Passport / ID number / 
Numéro de passeport / d'identité: ".$passport."</p>";
$message .= "<p>Address / Adresse: ".$address."</p>";
$message .= "<p>Vehicle registered / Véhicule immatriculé: ".$vehicle."</p>";
$message .= "<p>Number of residents / Nombre d'habitants: ".$residents."</p><br/><br/>";
$message .= "<p>Best regards / Meilleures salutations,</p>";
$message .= "<p>Accessone Team / Équipe Accessone</p>";
$message .= "<p>By / Par Security One</p></div>";
$message .= "</body></html>";

mail($userEmailTo, $subject, $message, $headers);


?>