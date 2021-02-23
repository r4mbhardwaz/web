<?php 
require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";


?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Jarvis - Devices</title>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/devices.css">
		<link rel="stylesheet" href="/assets/css/debugger.css">

		<script src="/assets/js/Jarvis.js" defer></script>
		<script src="/assets/js/classes/HTTP.js" defer></script>
		<script src="/assets/js/classes/Alerts.js" defer></script>
		<script src="/assets/js/classes/JarvisNLU.js" defer></script>
		<script src="/assets/js/classes/JarvisStatus.js" defer></script>
		<script src="/assets/js/main.js" defer></script>
		<script src="/assets/js/debugger.js" defer></script>
		<!-- <script src="/assets/js/jquery-3.5.1.min.js" defer></script> -->
		<!-- <script src="/assets/js/qrcode.js" defer></script> -->
	</head>

	<body>
		<?php echo $nav; ?>

		<h1>Debugger</h1>

		<div class="main-container">
			<p>Monitor and filter live-traffic</p>

			<div id="buttons">
				<button class="iconbutton" onclick="openConsole()"><i>code</i>Open console</button>

				<button style="margin-left:20px" class="iconbutton filter hidden" onclick="applyFilter('/hello', this)"><i>filter_alt</i>/hello</button>
				<button class="iconbutton filter hidden" onclick="applyFilter('/id/scan', this)"><i>filter_alt</i>/id/scan</button>
				<button class="iconbutton filter hidden" onclick="applyFilter('/get-devices', this)"><i>filter_alt</i>/get-devices</button>

				<button style="margin-left:20px" class="iconbutton green" id="start-debug" onclick="startDebugging()"><i>play_arrow</i>Start</button>
				<button class="iconbutton red hidden" id="stop-debug" onclick="stopDebugging()"><i>stop</i>Stop</button>
			</div>

			<div id="contents">
				
			</div>
		</div>

		<div id="append-your-dom-elements-here"></div>

		<?php 
		displaySideBar();
		displayFooter();
		?>
	</body>
</html>