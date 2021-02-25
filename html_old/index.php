<?php
require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";

if (isMobile()) {
	header("Location: /history/");
	die();
}

?>

<!DOCTYPE html>
<html>
	<head>
		<meta name="charset" content="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

		<title> Jarvis </title>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/index.css">
		
		<script src="/assets/js/files/index.js" defer></script>
		<script src="/assets/js/classes/HTTP.js" defer></script>
		<script src="/assets/js/classes/Alerts.js" defer></script>
		<script src="/assets/js/classes/JarvisNLU.js" defer></script>
		<script src="/assets/js/classes/JarvisStatus.js" defer></script>
		<script src="/assets/js/main.js" defer></script>
	</head>

	<body>
		<?php echo $nav ?>


		<?php if (isset($_GET["error"])): ?>
			<div class="notification red"><?php echo $_GET["message"] ?></div>
		<?php elseif (isset($_GET["success"])): ?>
			<div class="notification green"><?php echo $_GET["message"] ?></div>
		<?php endif; ?>

		
		<h1>
			<i>flash_on</i> Skills
			<button
				class="iconbutton text blue" style="right: 150px" id="import-skills-button"
				> <i>get_app</i> Import Skills </button>
			<button class="iconbutton text blue" id="export-skills" onclick="startSelectionForExportSkill()"> <i>publish</i> <span>Export Skills</span> </button>
		</h1>


		<div class="skills main-container">
			<div id="export-skills-buttons">
				<button id="export-skills-confirm" class="iconbutton" onclick="confirmSkillExport()"> <i>publish</i> Export selection </button>
				<button id="export-skills-all" class="iconbutton" onclick="selectAllSkillExport()"> <i>select_all</i> <span>Select all</span> </button>
				<button id="export-skills-cancel" class="iconbutton" onclick="cancelSkillExport()"> <i>clear</i> Cancel </button>
			</div>


			<div style="background-color: transparent" class="add-skill skill" onclick="window.location.href='/skill/add'">
				<div class="box">
					<i>add</i>
					<p class="heading"> Add a Skill</p>
				</div>
			</div>
			<?php foreach ($skills["skills"] as $skill => $data): ?>
				<div class="skill clickable" data-id="<?php echo $skill ?>">
					<i class="invisible red" title="Delete skill">delete</i>
					<img src="/assets/img/icons/<?php echo $data["image"] ?>" alt="">
					<p class="heading"><?php echo $data["name"] ?></p>
					<p class="grey description"><?php echo $data["description"] ?></p>
					<span class="quality"><?php echo getSkillQuality($skill, true, false) ?></span>
				</div>
			<?php endforeach; ?>
			<?php for ($i = 0; $i < 4 - (count($skills["skills"]) + 1) % 4; $i++): ?>
				<div class="skill filler" style="visibility:hidden"></div>	
			<?php endfor; ?>
		</div>

		<?php displaySideBar(); ?>
		<?php displayFooter(); ?>
	</body>
</html>