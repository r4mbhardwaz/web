<?php 

if (!isset($_GET["name"])) {
	header("Location: /?error&message=Couldn't delete intent: No name was provided");
	die();
}

require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";

$skill_id = getSkillIdForIntent($_GET["name"]);

if ($skill_id === false) {
	header("Location: /?error&message=Couldn't delete intent: Intent doesn't exist");
	die();
}

$d = [
	"skills" => [
		$skill_id => [
			"intents" => []
		]
	],
	"slots" => []
];

foreach ($skills["skills"][$skill_id]["intents"] as $intent => $data) {
	if ($intent == $_GET["name"]) {
		$d["skills"][$skill_id]["intents"][$intent] = $data;
		
		foreach ($data["slots"] as $slot) {
			$d["slots"][$slot] = $skills["slots"][$slot];
		}
	}
}

file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/trash/intent-$skill_id-" . $_GET["name"] . ".json", json_encode($d));

unset($skills["skills"][$skill_id]["intents"][$_GET["name"]]);
writeSkills();

header("Location: /skill/edit?id=$skill_id");
die();

?>