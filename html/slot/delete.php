<?php

if (!isset($_GET["slot"])) {
	header("Location: /?error&message=Failed to delete slot: No slot specified");
	die();
}

require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";

if (!isset($skills["slots"][$_GET["slot"]])) {
	header("Location: /?error&message=Failed to delete slot: Slot '" . $_GET["slot"] . "' doesn't exist");
	die();
}

$slotData = $skills["slots"][$_GET["slot"]];
file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/trash/slot-" . $_GET["slot"] . ".json", json_encode($slotData));

foreach ($skills["skills"] as $skillId => $skillData) {
	foreach ($skills["skills"][$skillId]["intents"] as $intentName => $intentData) {
		if (in_array($_GET["slot"], $intentData["slots"])) {
			deleteSlotFromIntent($_GET["slot"], $intentName);
		}
	}
}

unset($skills["slots"][$_GET["slot"]]);
writeSkills();

if (isset($_GET["intent"])) {
	header("Location: /slot/choose?intent=".$_GET["intent"]);
	die();
} else {
	header("Location: /?success&message=Successfully deleted slot ".$_GET["slot"]);
	die();
}

?>