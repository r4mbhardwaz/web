<?php 

if (!isset($_GET["id"])) {
	header("Location: /?error&message=Couldn't delete skill: No id provided");
	die();
}

require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";
require $_SERVER['DOCUMENT_ROOT'] . "/export.php";

file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/trash/skill-" . $_GET["id"] . ".json", $jsonData);

$name = @$skills["skills"][$_GET["id"]]["name"];
unset($skills["skills"][$_GET["id"]]);
writeSkills();

header("Location: /?success&message=Successfully deleted skill '$name'");
die();
?>