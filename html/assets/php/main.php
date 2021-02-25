<?php

$_PAGESTART = microtime(true);

$colors = [
	"#00c200",	# green
	// "#fadb67",	# yellow
	"#ff9b3f",	# orange
	"#ff3f3f",	# red
	"#3f65ff",	# blue
	"#ffffff"	# todo
];
$qualities = [
	"Excellent Quality",
	// "Good Quality",
	"Medium Quality",
	"Poor Quality"
];

$jarvis_path = "/jarvis";
$logfile = "$jarvis_path/log/jarvis.log";
$bestUtteranceCount = 30;


ini_set("display_errors", 1);
error_reporting(E_ALL);



session_start();
if (!isset($_SESSION["logged_in"]) && $_SERVER["PHP_SELF"] !== "/login.php") {
	$_SESSION["returnUri"] = $_SERVER["REQUEST_URI"];
	header("Location: /login");
	die();
}




####### HELPER FUNCTIONS
function isMobile() {
	return preg_match("/(android|webos|avantgo|iphone|ipad|ipod|blackberry|iemobile|bolt|boost|cricket|docomo|fone|hiptop|mini|opera mini|kitkat|mobi|palm|phone|pie|tablet|up\.browser|up\.link|webos|wos)/i", $_SERVER["HTTP_USER_AGENT"]);
}

function randstr($length = 10, $characters='0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
    $charactersLength = strlen($characters);
    $randomString = '';
    for ($i = 0; $i < $length; $i++) {
        $randomString .= $characters[rand(0, $charactersLength - 1)];
    }
    return $randomString;
}

function secondsToTime($inputSeconds) {
    $secondsInAMinute = 60;
    $secondsInAnHour = 60 * $secondsInAMinute;
    $secondsInADay = 24 * $secondsInAnHour;

    // Extract days
    $days = floor($inputSeconds / $secondsInADay);

    // Extract hours
    $hourSeconds = $inputSeconds % $secondsInADay;
    $hours = floor($hourSeconds / $secondsInAnHour);

    // Extract minutes
    $minuteSeconds = $hourSeconds % $secondsInAnHour;
    $minutes = floor($minuteSeconds / $secondsInAMinute);

    // Extract the remaining seconds
    $remainingSeconds = $minuteSeconds % $secondsInAMinute;
    $seconds = ceil($remainingSeconds);

    // Format and return
    $timeParts = [];
    $sections = [
        'd' => (int)$days,
        'h' => (int)$hours,
        'min' => (int)$minutes,
        's' => (int)$seconds,
    ];

    foreach ($sections as $name => $value){
        if ($value > 0){
            $timeParts[] = $value.$name;
        }
    }

    return implode(' ', $timeParts);
}
####### HELPER FUNCTIONS END



####### SCORING SYSTEM
function getSkillQuality($skillId, $asHTML=False, $intentMessage=True) {
	global $skills, $qualities, $colors;
	

	######################  DATA GATHERING
	$quality = 0;
	$skill = $skills["skills"][$skillId];
	$allUtterances = getAllUtterances($skillId, true);
	$allUtterancesArray = getAllUtterances($skillId);

	$intentCount = count($skill["intents"]);					// works
	$utterancesCount = count($allUtterancesArray);				// works
	$slotPercentageInTrainingExamples = 0;						// works
	$intentPoints = 0;


	if ($intentCount == 0 || $utterancesCount == 0) {
		if ($asHTML) {
			if ($intentMessage) {
				return "<span style='color:" . $colors[3] . "'>Add intents or training examples to measure quality</span>";
			} else { return; }
		} else {
			return -1;
		}
	}

	foreach ($allUtterancesArray as $utterance) {
		if (count($utterance) > 1) {
			$slotPercentageInTrainingExamples ++;
		}
	}

	foreach ($skill["intents"] as $intent => $__) {
		$intentPoints += getIntentQuality($intent);
	}
	$intentPoints /= $intentCount;

	$slotPercentageInTrainingExamples /= $utterancesCount;
	######################  DATA GATHERING FINISHED


	######################  DATA INTERPRETATION
	$intentCountScore = 1 / $intentCount;
	$slotPercentageInTrainingExamplesScore = $slotPercentageInTrainingExamples;
	

	$score = 	0.10 * $intentCountScore 						+ 
				0.35 * $slotPercentageInTrainingExamplesScore	+
				0.55 * $intentPoints;
	######################  DATA INTERPRETATION FINISHED

	
	if ($asHTML) {
	
		$infoBox = "<i	style='cursor:pointer;margin-left:10px;'
						onmouseover=\"showInfoBox(this, 'You can improve the quality {{percentage}} by <br><br>- adding more intents {{percentageIntents}} <br>- adding slots to your training examples {{percentageSlots}} <br>- improving existing intents {{percentageSingleIntents}}')\"
						onmouseout=\"removeInfoBox()\"
					>info</i>";
	
		$color = getColorForScore($score);
		$quality = getQualityStringForScore($score);
		$score = number_format($score, 3);
		$infoBox = 	str_replace("{{percentageIntents}}", 			addslashes("<span style='color:".getColorForScore($intentCountScore)."'>(" . number_format($intentCountScore*100, 1) . "%)</span>"),
					str_replace("{{percentageSlots}}",				addslashes("<span style='color:".getColorForScore($slotPercentageInTrainingExamplesScore)."'>(" . number_format($slotPercentageInTrainingExamplesScore*100, 1) . "%)</span>"), 
					str_replace("{{percentageSingleIntents}}",		addslashes("<span style='color:".getColorForScore($intentPoints)."'>(" . number_format($intentPoints*100, 1) . "%)</span>"), 
					str_replace("{{percentage}}",					addslashes("<span style='color:$color'>(" . number_format($score*100, 1) . "%)</span>"), $infoBox))));
		return "<span class='iconbutton' style='width:fit-content;color:$color'>$quality $infoBox</span>";
	} else {
		return $score;
	}
}

function getIntentQuality($intentName, $asHTML=false) {
	global $qualities, $colors, $bestUtteranceCount;

	$intent = getIntentInfo($intentName);
	if (!$intent) {
		return -1;
	}

	######################  DATA GATHERING
	$slotCount = count($intent["slots"]);
	$utterancesCount = count($intent["utterances"]);
	$slotPercentageInTrainingExamples = 0;

	foreach ($intent["utterances"] as $utt) {
		if (count($utt["data"]) > 1) {
			$slotPercentageInTrainingExamples++;
		}
	}

	$slotPercentageInTrainingExamples /= ($utterancesCount == 0 ? 1 : $utterancesCount);
	######################  DATA GATHERING FINISHED


	######################  DATA INTERPRETATION FINISHED
	$slotCountScore = 1;
	if ($slotCount < 4) {
		$slotCountScore = [0, 0.75, 0.9, 1][$slotCount];
	}


	$a = -1.5/(2*pow($bestUtteranceCount,2));
	$b = (1-pow($bestUtteranceCount, 2)*$a)/$bestUtteranceCount;
	$utterancesCountScore = $a * pow($utterancesCount, 2) + $b * $utterancesCount;
	
	$slotPercentageInTrainingExamplesScore = $slotPercentageInTrainingExamples * 1.2;
	
	######################  DATA INTERPRETATION FINISHED
	
	$score =	0.10 * $slotCountScore			+
				0.75 * $utterancesCountScore	+
				0.15 * $slotPercentageInTrainingExamplesScore;
		
	if ($asHTML) {

		$infoBox = "<i	style='cursor:pointer;margin-left:10px;'
						onmouseover=\"showInfoBox(this, 'You can improve the quality {{percentage}} by <br><br>- adding more slots {{percentageNumberSlots}} <br>- adding more training examples {{percentageTrainingExamples}} <br>- adding slots to your training examples {{percentageSlots}}')\"
						onmouseout=\"removeInfoBox()\"
					>info</i>";
	
		$color = getColorForScore($score);
		$quality = getQualityStringForScore($score);
		$score = number_format($score, 3);
		$infoBox = 	str_replace("{{percentageNumberSlots}}", 		addslashes("<span style='color:".getColorForScore($slotCountScore)."'>(" . number_format($slotCountScore*100, 1) . "%)</span>"),
					str_replace("{{percentageTrainingExamples}}",	addslashes("<span style='color:".getColorForScore($utterancesCountScore)."'>(" . number_format($utterancesCountScore*100, 1) . "%)</span>"),
					str_replace("{{percentageSlots}}",				addslashes("<span style='color:".getColorForScore($slotPercentageInTrainingExamplesScore)."'>(" . number_format($slotPercentageInTrainingExamplesScore*100, 1) . "%)</span>"), 
					str_replace("{{percentage}}",					addslashes("<span style='color:$color'>(" . number_format($score*100, 1) . "%)</span>"), $infoBox))));
		return "<span class='iconbutton' style='width:fit-content;color:$color'>$quality $infoBox</span>";
	} else {
		return $score;
	}
}

function getColorForScore($percentage) {
	global $colors;
	if ($percentage > 0.70) {	return $colors[0];	}
	if ($percentage > 0.50) {	return $colors[1];	}
	return $colors[2];
}

function getQualityStringForScore($percentage) {
	global $qualities;
	if ($percentage > 0.70) {	return $qualities[0];	}
	if ($percentage > 0.50) {	return $qualities[1];	}
	return $qualities[2];
}
####### SCORING SYSTEM END



function sortTrainingExamplesForIntent($intentName) {
	global $skills;
	$skillId = getSkillIdForIntent($intentName);

	usort($skills["skills"][$skillId]["intents"][$intentName]["utterances"], function($a,$b) {
		$fullString1 = "";
		$fullString2 = "";

		for ($i = 0; $i < count($a["data"]); $i++) { 
			$fullString1 .= $a["data"][$i]["text"];
		}
		for ($i = 0; $i < count($b["data"]); $i++) { 
			$fullString2 .= $b["data"][$i]["text"];
		}

		return strcmp($fullString1, $fullString2);
	});
}

function getAllUtterances($skillId, $flatten=false) {
	global $skills;
	$count = [];
	foreach ($skills["skills"][$skillId]["intents"] as $intent => $data) {
		foreach ($data["utterances"] as $utt) {
			$count[] = $utt["data"];
		}
	}

	if ($flatten) {
		return flatten($count);
	} else {
		return $count;
	}
}

function deleteSlotFromIntent($slot, $intent) {
	global $skills;
	
	$skill_id = getSkillIdForIntent($intent);

	$i = 0;
	$ind = false;
	foreach ($skills["skills"][$skill_id]["intents"][$intent]["slots"] as $slot_) {
		if ($slot_ == $slot) {
			$ind = $i;
			break;
		}
		$i++;
	}
	
	if ($ind === false) {
		return false;
	}

	array_splice($skills["skills"][$skill_id]["intents"][$intent]["slots"], $ind, 1);

	$x = 0;
	foreach($skills["skills"][$skill_id]["intents"][$intent]["utterances"] as $utt) {
		$uttData = $utt["data"];

		$z = 0;
		while ($z < count($uttData)) {
			if (isset($uttData[$z]["entity"]) && $uttData[$z]["entity"] == $slot) {

				if ($z == 0) {		// if slot at the beginning of the sentence
					if (isset($uttData[1])) {	// if another text after this
						if (!isset($uttData[1]["entity"])) {	// if text only, append
							$uttData[1]["text"] = $uttData[0]["text"] . $uttData[1]["text"];
							deleteIndexFromArray($uttData, 0);
							$z = -1; // z=0
						} else {	// if next one is slot, move to text
							unset($uttData[$z]["entity"]);
							unset($uttData[$z]["slot_name"]);
						}
					} else {
						unset($uttData[$z]["entity"]);
						unset($uttData[$z]["slot_name"]);
					}
				} elseif ($z == count($uttData) - 1) { // if text is at end
					if (isset($uttData[$z - 1]["entity"])) {	// if previous text is slot, keep as text
						unset($uttData[$z]["entity"]);
						unset($uttData[$z]["slot_name"]);
					} else {	// if previous is text, append 
						$uttData[$z - 1]["text"] .= $uttData[$z]["text"];
						deleteIndexFromArray($uttData, $z);
					}
				} else {
					if ( isset($uttData[$z - 1]["entity"], $uttData[$z + 1]["entity"]) ) {	// if between slots, keep as text
						unset($uttData[$z]["entity"]);
						unset($uttData[$z]["slot_name"]);
					} elseif ( isset($uttData[$z - 1]["entity"]) && !isset($uttData[$z + 1]["entity"]) ) { // if previous is slot
						$uttData[$z + 1]["text"] = $uttData[$z]["text"] . $uttData[$z + 1]["text"];
						deleteIndexFromArray($uttData, $z);
						$z = -1;
					} elseif ( !isset($uttData[$z - 1]["entity"]) && isset($uttData[$z + 1]["entity"]) ) { // if next is slot
						$uttData[$z - 1]["text"] .= $uttData[$z]["text"];
						deleteIndexFromArray($uttData, $z);
						$z = -1;
					} else {	// if text before and after
						$uttData[$z - 1]["text"] .= $uttData[$z]["text"] . $uttData[$z + 1]["text"];
						deleteIndexFromArray($uttData, $z);
						deleteIndexFromArray($uttData, $z);
						$z = -1;
					}
				}
			}

			$z++;
		}

		$skills["skills"][$skill_id]["intents"][$intent]["utterances"][$x]["data"] = $uttData;

		$x ++;
	}
}

function deleteIndexFromArray(&$a, $index) {
	array_splice($a, $index, 1);
}

function filterSynonyms($a) {
	if (count($a) == 1 && $a[0] == "") {
		return [];
	} else {
		return $a;
	}
}

function getSkillFileSize($formatted=false) {
	if ($formatted) {
		return formatSizeUnits(filesize($_SERVER['DOCUMENT_ROOT'] . "/database/skills.json"));
	} else {
		return filesize($_SERVER['DOCUMENT_ROOT'] . "/database/skills.json");
	}
}

function formatSizeUnits($bytes) {
	if ($bytes >= 1073741824) {
		$bytes = number_format($bytes / 1073741824, 2) . ' GB';
	}
	elseif ($bytes >= 1048576) {
		$bytes = number_format($bytes / 1048576, 2) . ' MB';
	}
	elseif ($bytes >= 1024) {
		$bytes = number_format($bytes / 1024, 2) . ' KB';
	}
	elseif ($bytes > 1) {
		$bytes = $bytes . ' bytes';
	}
	elseif ($bytes == 1) {
		$bytes = $bytes . ' byte';
	}
	else {
		$bytes = '0 bytes';
	}

	return $bytes;
}

function getSkillForIntent($name) {
	global $skills;
	foreach ($skills["skills"] as $skill => $data) {
		if (isset($data["intents"][$name])) {
			return $skills["skills"][$skill];
		}
	}
	return false;
}

function getSkillIdForIntent($name) {
	global $skills;
	foreach ($skills["skills"] as $skill => $data) {
		if (isset($data["intents"][$name])) {
			return $skill;
		}
	}
	return false;
}

function getSynonymCount($slot) {
	global $skills;
	$s = 0;

	foreach ($skills["slots"][$slot]["data"] as $data) {
		$s += count($data["synonyms"]);
	}

	return $s;
}

function getIntentInfo($name) {
	$s = getSkillForIntent($name);
	if ($s === false) {
		return false;
	}
	return $s["intents"][$name];
}

function getAllIntents() {
	global $skills;
	$ints = [];
	foreach ($skills["skills"] as $skill => $data) {
		$ints[] = array_keys($data["intents"]);
	}
	return flatten($ints);
}

function flatten(array $array) {
    $return = array();
    array_walk_recursive($array, function($a) use (&$return) { $return[] = $a; });
    return $return;
}

function writeSkills() {
	global $skills;
	// return file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/database/skills.json", json_encode($skills, JSON_PRETTY_PRINT), LOCK_EX);
	return file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/database/skills.json", json_encode($skills), LOCK_EX);
}

function getSkills() {
	return json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/database/skills.json"), true);
}

function getIconForDeviceType($type) {
	switch ($type) {
		case 'computer':
			return "desktop_mac";
		case 'laptop':
			return "laptop";
		case 'tablet':
			return "tablet_android";
		case 'mobile':
			return "phone_android";
		default:
			return "devices_other";
	}
}
function getIconForConnectionType($type) {
	switch ($type) {
		case 'app':
			return "phonelink_ring";
		case 'web':
			return "public";
		default:
			return "devices_other";
	}
}

function getJarvisConfig($file="/database/jarvis.conf") {
	$filepath = $_SERVER["DOCUMENT_ROOT"] . "/$file";
	return json_decode(file_get_contents($filepath), true);
}
function setJarvisConfig($key, $value, $file="/database/jarvis.conf") {
	$cnf = getJarvisConfig($file);
	$cnf[$key] = $value;
	$filepath = $_SERVER["DOCUMENT_ROOT"] . "/$file";
	@file_put_contents($filepath, json_encode($cnf));
}
function getWebExtensions($fornav=false) {
	$c = getJarvisConfig();

	if (!array_key_exists("loaded_apps", $c)) {
		$c["loaded_apps"] = [];
	}

	if ($fornav) {
		$code = "";

		for ($i = 0; $i < count($c["loaded_apps"]); $i++) { 
			$app = $c["loaded_apps"][$i];

			if ($app["web-extension"]["loaded"]) {
				$path = $app["web-extension"]["config"]["path"];
				$icon = $app["web-extension"]["config"]["material_icon"];
				$name = $app["web-extension"]["config"]["name"];

				$code .= "<span onclick=\"window.location.href='$path'\" class='iconbutton'> <i>$icon</i> $name</span>";
			}
		}

		return $code;
	}
}





$skills = getSkills();

$web_extensions = getWebExtensions(true);
$nav = "
<nav>
	<h2 onclick=\"window.location.href='/'\">Jarvis</h2>
	<span class=\"spacer\"></span>
	<!--	<span onclick=\"window.location.href='/log'\" class='iconbutton'> <i>rss_feed</i> Log</span> 				-->
	<!--	<span onclick=\"window.location.href='/history/'\" class='iconbutton'> <i>history</i> History</span> 		-->
	<span onclick=\"window.location.href='/devices'\" class='iconbutton'> <i>devices_other</i> Devices</span>
	<span onclick=\"window.location.href='/users'\" class='iconbutton'> <i>people</i> Users</span>
	<!--	<span onclick=\"window.location.href='/assistant'\" class='iconbutton'> <i>assistant</i> Assistant</span>	-->
	<span onclick=\"window.location.href='/login?logout'\" class='iconbutton'> <i>lock</i> Lock</span>
	<span onclick=\"window.location.href='/debugger'\" class='iconbutton'> <i>bug_report</i> Debugger</span>

	$web_extensions
</nav>
";


function displaySideBar() {
	echo "<div id='sidebar'>
		<h2>Jarvis - NLU</h2>
		<input id='commander' class='noshadow' placeholder='Enter a command'>
		<pre><code id='resulter'></code></pre>
	</div>";
}
function displayFooter() {
	global $_PAGESTART;
	echo "<div id='append-your-dom-elements-here' style='z-index:1'></div>
	<div id='no-break'></div>
	<div id='service-status'>
		<div class='sub'>	
			<div>
				<span>Skills-size:</span><!--".getSkillFileSize()."-->
				<span class='".(getSkillFileSize() < pow(2, 20) ? "green" : "red")."'>".getSkillFileSize(true)."</span>
			</div>
		</div>
		<div class='sub'></div>
		<div id='service-restart' class='dot orange material hidden'>refresh<span>Reload</span></div>
		<div id='service-stop' class='dot red material hidden'>close<span>Stop</span></div>
		<div id='service-start' class='dot green material hidden'>play_arrow<span>Start</span></div>
	</div>
	</div>";
}
