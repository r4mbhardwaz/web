<?php 
require_once $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";

$returnUri = "/slot/choose";
if (isset($_GET["returnUri"])) {
	$returnUri = $_GET["returnUri"];
}


if (isset($_GET["deleteValueFromSlot"])) {
	if (isset($_GET["name"], $_GET["value"], $_GET["synonyms"])) {
		if (!isset($skills["slots"][$_GET["name"]])) {
			die("SLOT_NOT_FOUND|Couldn't find slot '" . $_GET["name"] . "'");
		}
		
		$indexToDelete = false;

		$i = 0;
		foreach ($skills["slots"][$_GET["name"]]["data"] as $data) {
			if ($data["value"] == $_GET["value"] && filterSynonyms(array_map('trim', explode(",", $_GET["synonyms"]))) == $data["synonyms"]) {
				$indexToDelete = $i;
				break;
			}
			$i ++;
		}

		if ($indexToDelete === false) {
			die("VALUE_OR_SYNONYMS_NOT_FOUND|Couldn't find value and synonyms");
		}
				
		array_splice($skills["slots"][$_GET["name"]]["data"], $indexToDelete, 1);
		writeSkills();

		die("ok");
		
	} else {
		die("FIELDS_MISSING|You need to provide a 'name', 'value' and 'synonyms' field");
	}
}

if (isset($_GET["setSynonyms"])) {
	$slot_name = $_GET["slot"];
	if (!isset($skills["slots"][$slot_name])) {
		die("COULD_NOT_FIND_SLOT|The slot you provided couldn't be found");
	}
	$skills["slots"][$slot_name]["use_synonyms"] = boolval($_GET["setSynonyms"]);
	writeSkills();
	die("ok");
}
if (isset($_GET["setExtensible"])) {
	$slot_name = $_GET["slot"];
	if (!isset($skills["slots"][$slot_name])) {
		die("COULD_NOT_FIND_SLOT|The slot you provided couldn't be found");
	}
	$skills["slots"][$slot_name]["automatically_extensible"] = boolval($_GET["setExtensible"]);
	writeSkills();
	die("ok");
}
if (isset($_GET["setStrictness"])) {
	$slot_name = $_GET["slot"];
	if (!isset($skills["slots"][$slot_name])) {
		die("COULD_NOT_FIND_SLOT|The slot you provided couldn't be found");
	}
	$skills["slots"][$slot_name]["matching_strictness"] = floatval($_GET["setStrictness"]);
	writeSkills();
	die("ok");
}

if (isset($_GET["slot"])) {				# add values and synonyms
	if (!isset($skills["slots"][$_GET["slot"]])) {
		die("COULD_NOT_FIND_SLOT|The slot you provided couldn't be found");
	}
	if (isset($_GET["synonyms"], $_GET["value"])) {
		$skills["slots"][$_GET["slot"]]["data"][] = [ "value" => $_GET["value"], "synonyms" => filterSynonyms(array_map('trim', explode(",", $_GET["synonyms"]))) ];
		
		writeSkills();
		die("ok");
	} else {
		die("NO_VALUE_OR_SYNONYMS_SET|Please provide a value and a synonyms field (even if synonyms is empty)");
	}
}

if (isset($_GET["new-slot"])) {			# add new slot
	if (!isset($_GET["automatically_extensible"], $_GET["matching_strictness"], $_GET["use_synonyms"])) {
		die("FIELDS_MISSING|No fields for one or more of 'automatically_extensible', 'matching_strictness' or 'use_synonyms' provided");
	}
	if (isset($_GET["name"])) {
		$name = $_GET["name"];
		if (isset($skills["slots"][$name])) {
			die("SLOT_ALREADY_EXISTS|A slot with this name already exists");
		} else {
			$skills["slots"][$name] = [
				"data" => [],
				"automatically_extensible" => boolval($_GET["automatically_extensible"]),
				"matching_strictness" => floatval($_GET["matching_strictness"]),
				"use_synonyms" => boolval($_GET["use_synonyms"])
			];
			writeSkills();
			die("ok");
		}
	} else {
		die("NO_SLOT_NAME_PROVIDED|No slot name provided");
	}
}

if (isset($_GET["edit-slot"])) {		# change existing slot name/values
	if (!isset($_GET["name"])) {
		die("NO_SLOT_NAME|No slot name provided");
	}
	if (!isset($_GET["prev_name"])) {
		die("NO_PREV_NAME|Can't edit slot without previous name");
	}
	$name = $_GET["name"];
	$prev = $_GET["prev_name"];
	if (!isset($skills["slots"][$prev])) {
		die("SLOT_DOES_NOT_EXIST|The slot you want to delete doesn't exist");
	}
	if (isset($skills["slots"][$name])) {
		die("NEW_SLOT_ALREADY_EXISTS|The slot you want to move to already exists");
	}
	
	foreach ($skills["skills"] as $skillId => $skillData) {
		foreach ($skillData["intents"] as $intentName => $intentData) {
			if (in_array($prev, $intentData["slots"]) && !in_array($name, $intentData["slots"])) {
				######### RENAME INTENT
				unset($skills["skills"][$skillId]["intents"][$intentName]["slots"][array_search($prev, $intentData["slots"])]);
				$skills["skills"][$skillId]["intents"][$intentName]["slots"][] = $name;
			
				######### MODIFY EXISTING DATA
				$i = 0;
				foreach ($intentData["utterances"] as $utt) {
					for ($j = 0; $j < count($utt["data"]); $j++) {
						if (isset($utt["data"][$j]["entity"]) && $utt["data"][$j]["entity"] == $prev) {
							$skills["skills"][$skillId]["intents"][$intentName]["utterances"][$i]["data"][$j]["entity"] = $name;
							$skills["skills"][$skillId]["intents"][$intentName]["utterances"][$i]["data"][$j]["slot_name"] = $name;
						}
					}
					$i++;
				}
			}
		}
	}

	$skills["slots"][$name] = $skills["slots"][$prev];
	unset($skills["slots"][$prev]);
	writeSkills();
	die("ok");
}

?>
<!DOCTYPE html>
<html>
	<head>
		<meta name="charset" content="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

		<?php if (isset($edit)): ?>
			<title> Jarvis - Edit Slot </title>
		<?php else: ?>
			<title> Jarvis - Add a Slot </title>
		<?php endif; ?>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/slot-add.css">
		
		<script src="/assets/js/classes/HTTP.js" defer></script>
		<script src="/assets/js/classes/Alerts.js" defer></script>
		<script src="/assets/js/classes/JarvisNLU.js" defer></script>
		<script src="/assets/js/classes/JarvisStatus.js" defer></script>
		<script src="/assets/js/main.js" defer></script>
	</head>

	<body>
		<?php echo $nav ?>


		<h1> 
			<?php if (isset($edit)): ?>
				<i>edit</i>
				Edit Slot
			<?php else: ?>
				<i>add</i>
				Add a Slot
			<?php endif; ?>
			<i 	style="cursor: pointer"
				onmouseover="showInfoBox(this, 'A slot (also called entity) is a parameter in a spoken sentence. <br><br> For example: <br>\'Book me a flight to <span class=\'blue\'>New York</span>\', <br><br><span class=\'blue\'>New York</span> would be the slot value in a slot called \'City\'')"
				onmouseout="removeInfoBox()"
			>info</i>
		</h1>


		<div class="main-container">
			<button 
				style="position:absolute;top:-92px;right:0;"
				class="iconbutton"
				onclick="window.location.href='<?php echo $returnUri ?>'
			"> <i>keyboard_backspace</i> Back </button>

			<div class="basic-settings">
				<input type="text" placeholder="Slot name (city, location, etc...)"<?php echo (isset($edit) ? " value='$slot_name'" : "") ?>>
				
				<div class="checkbox">
					<?php if (isset($edit)): ?>
						<input type="checkbox" id="automatically-extensible"<?php echo ($skills["slots"][$slot_name]["automatically_extensible"] ? " checked" : "") ?>>
					<?php else: ?>
						<input type="checkbox" id="automatically-extensible" checked>
					<?php endif; ?>

					<label for="automatically-extensible">
						Automatically Extensible
						<i 
							style="cursor:pointer"
							onmouseover="showInfoBox(this, 'Check this box if you want Jarvis to automatically extend this slot at runtime.<br><br>If you want to use this slot for a light bulb and only want to accept a fixed set of colors (eg. red, green, blue), you shouldn\'t use this feature. \'Invalid\' colors (yellow, white, etc...) will be filtered out when unticked.<br><br>When you want to use this slot for a music player you should use this feature. You simply cannot provide all the artists and songs you want to hear, so Jarvis will automatically classify this information for you')"
							onmouseout="removeInfoBox()"
						>info</i>
					</label>
				</div>

				<div class="slider">
					<?php if (isset($edit)): ?>
						<input type="range" id="matching-strictness" min="0" max="1" value="<?php echo $skills["slots"][$slot_name]["matching_strictness"] ?>" step="0.01">
					<?php else: ?>
						<input type="range" id="matching-strictness" min="0" max="1" value="1" step="0.01">
					<?php endif; ?>
				
					<label for="matching-strictness">Matching Strictness
						<i
							style="cursor:pointer"
							onmouseover="showInfoBox(this, 'Controls the matching strictness of the slot. <br><br> 0.8 - 1 is recommended')"
							onmouseout="removeInfoBox()"
						>info</i>
					</label>
				</div>
			</div>

			<br><br>

			<div class="values">
				<h2>Values</h2>
				<div class="advanced-settings">
					<div class="checkbox">
						<?php if (isset($edit)): ?>
							<input type="checkbox" id="use-synonyms"<?php echo ($skills["slots"][$slot_name]["use_synonyms"] ? " checked" : "") ?>>
						<?php else: ?>
							<input type="checkbox" id="use-synonyms" checked>
						<?php endif; ?>
						<label for="use-synonyms">Use synonyms (Multiple synonyms must be seperated with commas)</label>
					</div>
				</div>
				<div class="input-area">
					<div class="input-area-new">
						<input type="text" id="input-new-value" class="noshadow" placeholder="Type your value here">
						<input type="text" id="input-new-synonyms" class="noshadow" placeholder="Type your synonym(s) (seperate with a comma)">
						<button class="text iconbutton" onclick="addSlotValue()"> <i>add</i> Add </button>
					</div>
					<div class="input-area-existing">
					<?php if (isset($edit)): ?>
						<?php if (count($skills["slots"][$slot_name]["data"]) == 0): ?>
								<p style="text-align:center">No values yet.</p>
						<?php else: ?>
							<?php foreach ($skills["slots"][$slot_name]["data"] as $slot_values): ?>
								<div class="slot-value">
									<span class="value"><?php echo $slot_values["value"] ?></span>
									<span class="synonyms"><?php echo implode(", ", $slot_values["synonyms"]) ?></span>
									<button class="iconbutton" onclick="deleteValueFromSlot(this)"> <i>delete</i> Delete </button>
								</div>
							<?php endforeach; ?>							
						<?php endif; ?>
					<?php else: ?>
							<p style="text-align:center">No values yet.</p>
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

		<script>
			let slotEdit = <?php echo (isset($edit) ? "true" : "false") ?>;
		</script>
	</body>
</html>