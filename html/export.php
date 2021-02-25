<?php

if (isset($_GET["id"])) {
	$_POST["skills"] = $_GET["id"];
}
if (!isset($_POST["skills"])) {
	header("Location: /?error&message=Couldn't export skils: No names were set");
	die();
}

require_once $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";
$s = explode(",", $_POST["skills"]);

$data = [
	"skills" => [],
	"slots" => []
];

foreach ($s as $skillId) {
	if (isset($skills["skills"][$skillId])) {
		$data["skills"][$skillId] = $skills["skills"][$skillId];
		foreach ($skills["skills"][$skillId]["intents"] as $intent => $d) {
			foreach ($d["slots"] as $slot) {
				if (!isset($data[$slot])) {
					$data["slots"][$slot] = $skills["slots"][$slot]; 
				}
			}
		}
	} else {
		if (!isset($_GET["id"])) {
			header("Location: /?error&message=Couldn't export skill with id '" . $skillId . "': doesn't exist!");
			die();
		}
	}
}

$jsonData = json_encode($data);
if (!isset($_GET["id"]) || isset($_GET["download"])) {
	$fname = "exported-skills.json";
	if (isset($_GET["fname"])) {
		$fname = $_GET["fname"];
	}
	header('Content-Type: application/octet-stream');
	header("Content-Transfer-Encoding: Binary"); 
	header("Content-Disposition: attachment; filename=\"$fname\""); 
	header("Content-Length: " . strlen($jsonData));
	echo $jsonData;
}
?>