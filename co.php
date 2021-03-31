<?php
$reason=$_POST['reason'];
$visitor_name=$_POST['visitor_name'];
$agent_name=$_POST['agent_name'];
$agent_passcode=$_POST['agent_passcode'];


$subject = 'ACCESSONE - YOUR RESIDENT APP';
// $userEmailTo=$data->emailTo;
$userEmailTo = 'salvagoar@gmail.com';
// $userEmailTo = 'salvagoar@gmail.com';

$headers = "From: accessone@securityonegroup.mu\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=utf-8\r\n";



$message = '<html><body style="text-align: center; padding: 30px; font-weight: 100;">';
$message .= '<h3>ACCESSONE - YOUR RESIDENT APP ACCESS OVERRIDE REQUEST</h3>';
$message .= '<img style="width: 220px; margin: 30px auto;" src="https://vms.s-onedigital.com/img/accessone-black-nobackgound.png" alt="Logo" />';
$message .= "<div style='text-align: left;'><h3>DEAR Admin,</h3><br/><br/>";


$message .= "<h3>Agent ovverride the pass.</h3><br/><br/>";
$message .= "Override details :<br/>";
$message .= "<p>Type of ovverride : the visitor camed too ".$reason."</p>";
$message .= "<p>Visitor name : ".$visitor_name."</p><br/><br/>";
$message .= "<p>Agent name : ".$agent_name."</p><br/><br/>";
$message .= "<p>Agent number : ".$agent_passcode."</p><br/><br/>";
$message .= "<p>Best regards,</p>";
$message .= "<p>Accessone Team</p>";
$message .= "<p>By Security One</p></div>";
$message .= "</body></html>";

mail($userEmailTo, $subject, $message, $headers);


?>