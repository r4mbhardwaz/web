<?php 
require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";


if (isset($_GET["deleteTrainingExample"])) {
	if (isset($_GET["index"], $_GET["intent"])) {
		$skill_id = getSkillIdForIntent($_GET["intent"]);
		if ($skill_id === false) {
			die("INTENT_NOT_FOUND|This intent doesn't exist");
		}
		if (isset($skills["skills"][$skill_id]["intents"][$_GET["intent"]]["utterances"][$_GET["index"]])) {
			array_splice($skills["skills"][$skill_id]["intents"][$_GET["intent"]]["utterances"], $_GET["index"], 1);
			writeSkills();
			die("ok");
		} else {
			die("UTTERANCE_NOT_FOUND|This utterance index couldn't be found");
		}
	} else {
		die("FIELDS_MISSING|Both the 'index' and 'intent' field has to be set");
	}
}
if (isset($_GET["changeSelection"])) {
	if (isset($_GET["index"], $_GET["data"], $_GET["intent"])) {
		$skill_id = getSkillIdForIntent($_GET["intent"]);
		if ($skill_id === false) {
			die("INTENT_NOT_FOUND|This intent doesn't exist");
		}
		if (isset($skills["skills"][$skill_id]["intents"][$_GET["intent"]]["utterances"][intval($_GET["index"])])) {
			$skills["skills"][$skill_id]["intents"][$_GET["intent"]]["utterances"][intval($_GET["index"])]["data"] = json_decode($_GET["data"], true);
			writeSkills();
			die("ok");
		} else {
			die("UTTERANCE_NOT_FOUND|This utterance index couldn't be found");
		}
	} else {
		die("FIELDS_MISSING|Both the 'index' and 'data' field have to be set");
	}
}
if (isset($_GET["addTrainingExample"])) {
	if (isset($_GET["intent"], $_GET["example"])) {
		$skill_id = getSkillIdForIntent($_GET["intent"]);
		if ($skill_id === false) {
			die("INTENT_NOT_FOUND|This intent doesn't exist");
		}

		$skills["skills"][$skill_id]["intents"][$_GET["intent"]]["utterances"][] = ["data" => [["text" => $_GET["example"]]]];
		writeSkills();
		die("ok");
	} else {
		die("FIELDS_MISSING|You have to provide both 'intent' and 'example' fields");
	}
}

if (isset($_GET["deleteSlotFromIntent"])) {
	if (isset($_GET["intent"], $_GET["slot"])) {
		$skill_id = getSkillIdForIntent($_GET["intent"]);
		if ($skill_id === false) {
			die("INTENT_NOT_FOUND|Intent '" . $_GET["intent"] . "' couldn't be found");
		}
		$i = 0;
		$removeIndex = false;
		foreach ($skills["skills"][$skill_id]["intents"][$_GET["intent"]]["slots"] as $slot) {
			if ($slot == $_GET["slot"]) {
				$removeIndex = $i;
				break;
			}
			$i++;
		}

		if ($removeIndex === false) {
			die("SLOT_NOT_FOUND|Couldn't find slot '".$_GET["slot"]."' in '".$_GET["intent"]."'");
		}

		deleteSlotFromIntent($_GET["slot"], $_GET["intent"]);
		writeSkills();

		die("ok");
	} else {
		die("MISSING_VALUES|No 'intent' or 'slot' argument set");
	}
	die("MISSING_VALUES|No 'intent' or 'slot' argument set");
}

if (!isset($_GET["name"])) {
	header("Location: /?error&message=No intent provided");
	die();
}

$intent_name = $_GET["name"];

$skill = getSkillForIntent($intent_name);
$intent = getIntentInfo($intent_name);
$skill_id = getSkillIdForIntent($intent_name);

if ($skill === false) {
	header("Location: /?error&message=Couldn't find intent '$intent_name'");
	die();
}

if (isset($_GET["sort"])) {
	sortTrainingExamplesForIntent($intent_name);
	writeSkills();
	header("Location: /intent/edit?name=$intent_name");
	die();
}

if (isset($_GET["addSlot"])) {
	if (!in_array($_GET["addSlot"], $skills["skills"][$skill_id]["intents"][$intent_name]["slots"])) {
		$skills["skills"][$skill_id]["intents"][$intent_name]["slots"][] = $_GET["addSlot"];
		writeSkills();
	}
	header("Location: /intent/edit?name=" . $_GET["name"]);
	die();
}
?>

<!DOCTYPE html>
<html>
	<head>
		<meta name="charset" content="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

		<title> Jarvis - Edit Intent </title>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/intent-edit.css">
		<link rel="stylesheet" href="/assets/css/index.css">

		<script src="/assets/js/files/intent-edit.js" defer></script>
		<script src="/assets/js/classes/HTTP.js" defer></script>
		<script src="/assets/js/classes/Alerts.js" defer></script>
		<script src="/assets/js/classes/JarvisNLU.js" defer></script>
		<script src="/assets/js/classes/JarvisStatus.js" defer></script>
		<script src="/assets/js/main.js" defer></script>
		<script src="/assets/js/intent-slot-connector.js" defer></script>
	</head>

	<body>
		<?php echo $nav ?>


		<h1> <span class="hidden-button" onclick="window.location.href='/skill/edit?id=<?php echo $skill_id ?>'"> <?php echo $skill["name"] ?> </span> <i style="margin-left: 10px">trending_flat</i> <?php echo $intent_name ?> </h1>


		<div class="main-container intent-container">
			<div class="slots">
				<div class="slots-info">
					<h2> <span> <?php echo count($intent["slots"]) ?> Slots</span><i
						 	style="cursor:pointer"
							onmouseover="showInfoBox(this, 'Slots are used to extract pieces of information (parameters) in a sentence.<br><br>Example:<br>Turn <span class=\'blue\'>off</span> the lights in the <span class=\'blue\'>kitchen</span><br><br>on/off would be a slot called \'state\' and kitchen be a slot called \'room\'')"
							onmouseout="removeInfoBox()"
						>info</i>
					</h2>
				</div>

				<div class="slots-container">
					<button class="green iconbutton" onclick="window.location.href='/slot/choose?intent=<?php echo $intent_name ?>'">
					<i>add</i>
						Add new Slot
					</button>

					<?php if (count($intent["slots"]) == 0): ?>
						<div class="slot empty">
						<p> No Slots yet... </p>
					</div>
					<?php else: ?>
						<?php $i = 0; $slotColors = []; ?>
						<?php foreach ($intent["slots"] as $slot): ?>
							<div class="slot">
								<div class="side-color" data-color="<?php echo $colors[$i] ?>" style="background-color:<?php echo $colors[$i] ?>"></div>
								<?php $slotColors[$slot] = $colors[$i]; ?>
								<span class="name"> <?php echo $slot ?> </span>
								<span class="values">
									<?php echo count($skills["slots"][$slot]["data"]) ?> entries 
									<br>
									<?php echo getSynonymCount($slot); ?> synonyms
								</span>
								<i class="edit" onclick="window.location.href='/slot/edit?returnUri=/intent/edit?name=<?php echo $_GET["name"]; ?>&name=<?php echo $slot ?>'">edit</i>
								<i class="delete" onclick="deleteSlotFromIntent(this, '<?php echo $slot ?>')">delete</i>
							</div>
							<?php $i++; ?>
						<?php endforeach; ?>
					<?php endif; ?>
				</div>
			</div>
			
			<div class="values">
				<div class="slots-info">
					<h2>
						<?php echo count($skills["skills"][$skill_id]["intents"][$intent_name]["utterances"]) ?> 
						Training Examples<i
							style="cursor:pointer"
							onmouseover="showInfoBox(this, 'Training examples are being used to train a neural network model. Add as many different examples as possible and add proper slots (by selecting text) to ensure the best quality')"
							onmouseout="removeInfoBox()"
						>info</i>
					</h2>

					<button class="iconbutton text blue" onclick="window.location.href='/intent/edit?name=<?php echo $_GET["name"] ?>&sort'"> <i>sort</i> Sort examples </button>
				</div>

				<div class="input-field">
					<div class="input-new">
						<input type="text" class="noshadow" placeholder="Type your training example...">
						<button class="text iconbutton" onclick="addTrainingExample()"> <i>add</i> Add </button>
					</div>
					<div class="training-examples">
						<?php if (count($skills["skills"][$skill_id]["intents"][$intent_name]["utterances"]) == 0): ?>
							<p> No training examples yet. Start by adding one in the input field above </p>	
						<?php else: ?>
							<?php $i = 0; ?>
							<?php foreach($skills["skills"][$skill_id]["intents"][$intent_name]["utterances"] as $utterance): ?>
								<div class="training-example">
									<p class="highlightable" data-index="<?php echo $i ?>">
										<span>
											<?php foreach ($utterance["data"] as $data): ?>
												<?php if (count($data) == 1): ?>
													<?php echo $data["text"] ?>
												<?php else: ?>
													<span<?php echo (isset($data["entity"]) ? " data-slot='".$data["entity"]."' style='color:#fff;background-color:" . $slotColors[$data["entity"]] . "' class='highlighter'" : "") ?>><?php echo $data["text"] ?></span>
												<?php endif; ?>
											<?php endforeach; ?>
										</span>
									</p>
									<button class="iconbutton" onclick="deleteTrainingExample(this)"> <i>delete</i> Delete </button>
								</div>
								<?php $i ++; ?>
							<?php endforeach; ?>
						<?php endif; ?>
					</div>
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