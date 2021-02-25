<?php
require "../assets/php/main.php";

if (isset($_POST["add-skill"])) {
	$id = randstr(8, "0123456abcdef");

	$skills["skills"][$id] = [
		"name" => $_POST["name"],
		"description" => $_POST["desc"],
		"script" => $_POST["script"],
		"image" => $_POST["image"],
		"intents" => new ArrayObject()	# so that it saves {} instead of []
	];

	$result = writeSkills();

	if ($result) {
		header("Location: /skill/edit?id=$id");
	} else {
		header("Location: /?error&message=Couldn't add new skill. Make sure database/skills.json is writable!");
	}

	die();
}
?>

<!DOCTYPE html>
<html>
	<head>
		<meta name="charset" content="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

		<title> Jarvis - Add a Skill </title>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/skill-add.css">
		
		<script src="/assets/js/classes/HTTP.js" defer></script>
		<script src="/assets/js/classes/Alerts.js" defer></script>
		<script src="/assets/js/classes/JarvisNLU.js" defer></script>
		<script src="/assets/js/classes/JarvisStatus.js" defer></script>
		<script src="/assets/js/main.js" defer></script>
	</head>

	<body>
		<?php echo $nav ?>


		<h1> <i>add</i> Add a skill </h1>

		
		<form class="new-skill main-container" action="" method="post">
			<div>
				<div class="skill-image">
					<img src="/assets/img/icons/colorwheel.svg">
					<input name="image" value="colorwheel.svg" hidden>
				</div>
				<div class="skill-header">
					<input type="text" name="name" 		id="skill-name" 	placeholder="Skill name"						autocomplete="off"	required>
					<input type="text" name="script" 	id="skill-script" 	placeholder="Skill script name (weather.py)"	autocomplete="off"	required>
					<input type="text" name="desc" 		id="skill-desc" 	placeholder="Skill description"					autocomplete="off"	required>
					
					<div class="image-chooser">
						<button class="orange" onclick="document.querySelector('.image-container').classList.toggle('visible')" type="button">Choose image</button>
						<div class="image-container">
							<?php foreach (array_diff(scandir($_SERVER['DOCUMENT_ROOT'] . "/assets/img/icons"), array('.', '..')) as $imgpath): ?>
							<img src="/assets/img/icons/<?php echo $imgpath ?>" onclick="setSkillImage('<?php echo $imgpath ?>')">
							<?php endforeach; ?>
						</div>
					</div>
					<button class="green" type="submit" name="add-skill">+ Add</button>
				</div>
			</div>
		</form>

		<?php displaySideBar(); ?>
<?php displayFooter(); ?>

	</body>
</html>