<?php 
if (!isset($_GET["id"])) {
	header("Location: /history/");
	die();
}

$f = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/database/history.json"), true);
$action = false;
foreach ($f as $a) {
	if ($a["id"] == $_GET["id"]) {
		$action = $a;
	}
}
if ($a === false) {
	header("Location: /history/");
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
		<h1> Jarvis - <?php echo $action["intent"] ?> </h1>

	</body>
</html>