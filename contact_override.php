<?php
$reasons=$_POST['reason'];


$visitor_name=$_POST['visitor_name'];
$visitor_type=$_POST['visitor_type'];
$visitor_phone=$_POST['visitor_phone'];
$visitor_email=$_POST['visitor_email'];
$timedatefrom=$_POST['timedatefrom'];
$timedateto=$_POST['timedateto'];
$vehicle=$_POST['vehicle'];
$guests=$_POST['guests'];
$visitor_area=$_POST['visitor_area'];
$resident_name=$_POST['resident_name'];
$resident_email=$_POST['resident_email'];
$resident_phone=$_POST['resident_phone'];
$resident_passid=$_POST['resident_passid'];
$resident_residents=$_POST['resident_residents'];
$resident_vehicle=$_POST['resident_vehicle'];
$resident_address=$_POST['resident_address'];

// $=$_POST[''];

$agent_name=$_POST['agent_name'];
$agent_passcode=$_POST['agent_passcode'];
$agent_phone=$_POST['agent_phone'];
$agent_email=$_POST['agent_email'];


$subject = 'ACCESSONE - OVERRIDE REQUEST';
// $userEmailTo=$data->emailTo;
$userEmailTo = 'accessone@securityonegroup.mu';
// $userEmailTo = 'salvagoar@gmail.com';

$headers = "From: accessone@securityonegroup.mu\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/html; charset=utf-8\r\n";

$headers .= 'Cc: norman@webdg.net, thomas@webdg.net, salvagoar@gmail.com' . "\r\n";

if($reasons == 'late') {
    $reason = 'later';
} else {
    $reason = 'earlier';
}

$message = '<html><body style="text-align: center; padding: 30px; font-weight: 100;">';

$message .= '<img style="width: 220px; margin: 30px auto;" src="https://a1admin.kronosun.com/img/accessone-black-nobackgound-x.png" alt="Logo" />';
$message .= '<h3>ACCESSONE - YOUR RESIDENT APP ACCESS OVERRIDE REQUEST</h3>';

$message .= "<div style='text-align: left;'><h3>DEAR Admin,</h3><br/><br/>";


$message .= "<h3>Pass overridden by agent.</h3><br/><br/>";
// $message .= "Override details :<br/>";
$message .= "<h4>Type of override: The visitor checked in ".$reason."</h4><br>";

$message .= "<p>Residence area: ".$visitor_area."</p>";

$message .= "<h4>Visitor</h4>";
$message .= "<p>Name: ".$visitor_name."</p>";
$message .= "<p>Type: ".$visitor_type."</p>";
$message .= "<p>Phone: ".$visitor_phone."</p>";
$message .= "<p>Email: ".$visitor_email."</p>";


$message .= "<h4>Pass</h4>";

$message .= "<p>Valid from: ".$timedatefrom."</p>";
$message .= "<p>Valid to: ".$timedateto."</p>";
$message .= "<p>Vehicle /s number: ".$vehicle."</p>";
$message .= "<p>Number of guests: ".$guests."</p>";


$message .= "<h4>Resident</h4>";
$message .= "<p>Name: ".$resident_name."</p>";
$message .= "<p>Email: ".$resident_email."</p>";
$message .= "<p>Phone: ".$resident_phone."</p>";
$message .= "<p>Passport / ID number: ".$resident_passid."</p>";
$message .= "<p>Number of residents: ".$resident_residents."</p>";
$message .= "<p>Vehicle /s number: ".$resident_vehicle."</p>";
$message .= "<p>Address: ".$resident_address."</p>";

$message .= "<h4>Agent</h4>";
$message .= "<p>Agent name: ".$agent_name."</p>";
$message .= "<p>Agent number: ".$agent_passcode."</p>";
$message .= "<p>Agent phone: ".$agent_phone."</p>";
$message .= "<p>Agent email: ".$agent_email."</p><br/><br/>";
$message .= "<p>Best regards,</p>";
$message .= "<p>Accessone Team</p>";
$message .= "<p>By Security One</p></div>";
$message .= "</body></html>";

mail($userEmailTo, $subject, $message, $headers);


?>