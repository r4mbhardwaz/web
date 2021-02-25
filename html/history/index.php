<?php

if (isset($_GET["getUpdate"])) {
	if (isset($_GET["lastUpdate"])) {

	} else {

	}
}
if (isset($_GET["getLatest"])) {
	header("Content-Type: application/json");
	$count = 10;
	if (isset($_GET["count"])) {
		$count = $_GET["count"];
	}

	$f = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/database/history.json"), true);

	$nthLatest = array_slice($f, count($f) - $count);
	echo json_encode(["ok" => true, "actions" => $nthLatest]);
	die();
}

?>

<!DOCTYPE html>
<html>
	<head>
		<meta name="charset" content="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

		<title> Jarvis - History </title>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/history.css">
		<script src="/assets/js/history.js" defer></script>
	</head>

	<body>
		<h1> Jarvis </h1>

		<div class="content">
			<div id="timeline"></div>
			<div id="updates"></div>
		</div>
	</body>
</html>