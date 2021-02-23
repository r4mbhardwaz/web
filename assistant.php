<?php
require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";


if (isset($_POST["submit"])) {
	if (!isset($_POST["name"], $_POST["wakeword"], $_POST["language"], $_POST["selected-skills"])) {
		header("Location: /assistant?error&message=Couldn't save assistant: Some fields are missing");
		die();
	}

	$name = $_POST["name"];
	$wakewordFile = $_POST["wakeword"];
	$languageCode = $_POST["language"];
	$selectedSkills = explode(",", $_POST["selected-skills"]);

	$_GET["id"] = $_POST["selected-skills"];
	require $_SERVER['DOCUMENT_ROOT'] . "/export.php";

	$assistantInfo = json_decode($jsonData, true);
	$assistantInfo["language"]	= $languageCode;
	$assistantInfo["wakeword"]	= $wakewordFile;
	$assistantInfo["name"]		= $name;
	$assistantInfo = json_encode($assistantInfo);

	file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/trash/assistant-$name.json", $assistantInfo);
	file_put_contents($_SERVER['DOCUMENT_ROOT'] . "/database/assistant.json", $assistantInfo);

	header('Content-Type: application/octet-stream');
	header("Content-Transfer-Encoding: Binary");
	header("Content-Disposition: attachment; filename=\"assistant-$name.json\""); 
	header("Content-Length: " . strlen($assistantInfo));
	echo $assistantInfo;
	die();	
}

$assistantInfo = @json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/database/assistant.json"), true);

?>

<!DOCTYPE html>
<html>
	<head>
		<meta name="charset" content="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

		<title> Jarvis </title>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/index.css">
		<link rel="stylesheet" href="/assets/css/assistant.css">
		
		<script src="/assets/js/files/assistant.js" defer></script>
		<script src="/assets/js/classes/HTTP.js" defer></script>
		<script src="/assets/js/classes/Alerts.js" defer></script>
		<script src="/assets/js/classes/JarvisNLU.js" defer></script>
		<script src="/assets/js/classes/JarvisStatus.js" defer></script>
		<script src="/assets/js/main.js" defer></script>
	</head>

	<body>
		<?php echo $nav ?>
		
		<h1>
			<i>assistant</i>
			Assistant 
			<i 	style="cursor:pointer; margin:0 0 0 10px" onmouseout="removeInfoBox()"
				onmouseover="showInfoBox(this, 'You can add all your defined skills to an assistant and deploy it within seconds.')">info</i> 
		</h1>

		
		<div class="main-container">
			<form action="/assistant" method="post">
				<input <?php if (isset($assistantInfo["name"])) { echo "value='" . $assistantInfo["name"] . "' "; } ?>name="name" type="text" style="grid-area:name" placeholder="Name of your assistant" autocomplete="off" required>
				<select <?php if (isset($assistantInfo["hotword"])) { echo "value='" . $assistantInfo["hotword"] . "' "; } ?>name="wakeword" style="grid-area:wakeword" required>
					<option value="" disabled selected>Wakeword</option>		
					<option value="alexa.hotword">Alexa</option>
					<option value="jarvis.hotword">Jarvis</option>
				</select>
				<select <?php if (isset($assistantInfo["language"])) { echo "value='" . $assistantInfo["language"] . "' "; } ?>name="language" style="grid-area:language" required>
					<option value="" disabled selected>Language</option>		
					<option value="en">English</option>
					<option value="de">German</option>
					<option value="es">Spanish</option>
					<option value="fr">French</option>
					<option value="it">Italian</option>
				</select>

				<h2 style="grid-area:text;margin-bottom:0px" class="buttonheader">
					Select skills: 
					<button	class="iconbutton" type="button"><i>select_all</i><span>Select all</span></button>
				</h2>

				<input type="hidden" name="selected-skills" value="">
				<div class="skills" style="grid-area:skills">
					<?php foreach ($skills["skills"] as $skill => $data): ?>
						<div class="skill clickable select<?php if (isset($assistantInfo["skills"][$skill])) { echo " selected"; } ?>" data-id="<?php echo $skill ?>">
							<img src="/assets/img/icons/<?php echo $data["image"] ?>" alt="">
							<p class="heading"><?php echo $data["name"] ?></p>
							<p class="grey description"><?php echo $data["description"] ?></p>
						</div>
					<?php endforeach; ?>
					<?php if (count($skills["skills"]) % 4 !== 4): ?>
						<?php for ($i = 0; $i < count($skills["skills"]) % 4; $i++): ?>
							<div class="skill filler" style="visibility:hidden"></div>	
						<?php endfor; ?>
					<?php endif; ?>
				</div>

				<button type="submit" name="submit" style="grid-area:submit" class="iconbutton"> <i>save</i> Save assistant </button>
			</form>
		</div>

		<script>
			// test snipped for faster testing
			document.querySelector("input[name=name]").value = "Jarvis";
			document.querySelector("select[name=wakeword]").value = "alexa.hotword";
			document.querySelector("select[name=language]").value = "de";
			document.querySelector("input[name=selected-skills]").value = "513bee3d,6002aa6b,54345e44";
		</script>

		<?php displaySideBar(); ?>
<?php displayFooter(); ?>
	</body>
</html>