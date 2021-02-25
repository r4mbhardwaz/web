<?php
require_once "assets/php/main.php";

function shutdown() {
    // This is our shutdown function, in 
    // here we can do any last operations
    // before the script is complete.

	echo "<div id='append-your-dom-elements-here'></div></body></html>";
}

register_shutdown_function('shutdown');

?>
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title> <?php echo (isset($title) ? $title : "Jarvis Extension")  ?> </title>
	
		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/extension.css">
		<script src="/assets/js/classes/Alerts.js"></script>
		<script src="/assets/js/classes/HTTP.js"></script>
	</head>

	<body>
		<?php echo $nav; ?>