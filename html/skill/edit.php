<?php
require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";

if (!isset($_GET["id"])) {
	header("Location: /?error&message=No ID provided!");
	die();
}
if (!isset($skills["skills"][$_GET["id"]])) {
	header("Location: /?error&message=Couldn't find skill with ID '" . $_GET["id"] . "'");
	die();
}

if (isset($_GET["intents"])) { # api call
	$ints = explode(",", $_GET["intents"]);
	$returnData = [
		"intentAlreadyExists" => false,
		"existingIntent" => ""
	];
	foreach ($skills["skills"] as $skill => $data) {
		if ($skill == $_GET["id"]) { continue; }
		$ints2 = array_keys($data["intents"]);
		$intersect = array_intersect($ints, $ints2);
		if (count($intersect) != 0) {	# duplicates
			$returnData["intentAlreadyExists"] = true;
			$returnData["existingIntent"] .= implode(",", $intersect) . ",";
		}
	}
	if (!$returnData["intentAlreadyExists"]) {
		foreach ($ints as $intt) {
			if (!isset($skills["skills"][$_GET["id"]]["intents"][$intt])) {
				$skills["skills"][$_GET["id"]]["intents"][$intt] = [
					"slots" => new ArrayObject(),
					"utterances" => []
				];
			}
		}
		writeSkills();
	}
	die(json_encode($returnData));
}

$skill = $skills["skills"][$_GET["id"]];
?>

<!DOCTYPE html>
<html>
	<head>
		<meta name="charset" content="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

		<title> Jarvis - Edit Skill </title>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/skill-edit.css">
		<link rel="stylesheet" href="/assets/css/index.css">
		
		<script src="/assets/js/files/skill-edit.js" defer></script>
		<script src="/assets/js/classes/HTTP.js" defer></script>
		<script src="/assets/js/classes/Alerts.js" defer></script>
		<script src="/assets/js/classes/JarvisNLU.js" defer></script>
		<script src="/assets/js/classes/JarvisStatus.js" defer></script>
		<script src="/assets/js/main.js" defer></script>

		<script>
			const allIntents = <?php echo json_encode(getAllIntents()); ?>;
		</script>
	</head>
	
	<body>
		<?php echo $nav ?>


		<div class="header">
			<img src="/assets/img/icons/<?php echo $skill["image"] ?>">
			<h1 class="buttonheader"> <?php echo $skill["name"] ?>
				<button
					class="blue iconbutton text"
					onclick="window.location.href='/export?download&fname=skill-<?php echo $skills["skills"][$_GET["id"]]["name"] ?>.json&id=<?php echo $_GET["id"] ?>'"
					> <i>publish</i> Export Skill </button> 
			</h1>
			<p> <?php echo $skill["description"] ?> </p>
			<span class="iconbutton" style="width:fit-content"> <?php echo getSkillQuality($_GET["id"], True) ?></span>
		</div>


		<div class="main-container">
			<div class="intents">
				<h2 class="buttonheader">Intents
					<button class="iconbutton text blue" onclick="launchInput(addIntent, 'Intent name', 'Enter a name for the new intent (no spaces and numbers allowed)')">
						<i>add</i>
						<span>Create Intent</span>
					</button>
				</h2>
				

				<div class="intents-box">
					<?php if (count($skill["intents"]) == 0): ?>
						<p id="no-intents"> No intents yet. </p>
					<?php endif; ?>
					<?php foreach ($skill["intents"] as $intent => $data): ?>
					<div class="intent skill clickable" data-id=<?php echo $intent ?> data-name="<?php echo $intent ?>">
						<i class="invisible red" title="Delete intent">delete</i>
						<span class="description"><?php echo $intent; ?></span>
						<span class="tests"><?php echo count($data["utterances"]); ?> utterances<br><?php echo count($data["slots"]) ?> slots</span>
						<span class="quality"> <?php echo getIntentQuality($intent, true) ?> </span>
					</div>
					<?php endforeach; ?>
					<?php for ($i = 0; $i < 4 - ((count($skill["intents"])) % 4); $i++): ?>
						<div class="skill filler" style="visibility:hidden"></div>	
					<?php endfor; ?>
				</div>
			</div>
		</div>

		<?php displaySideBar(); ?>
		<?php displayFooter(); ?>

		<div class="status" id="status">
			<div class="description" id="status-description">Everything up-to-date</div>
			<div class="dot green" id="status-dot"></div>
		</div>
	</body>
</html>