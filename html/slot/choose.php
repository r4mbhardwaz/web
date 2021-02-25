<?php 
require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";

if (!isset($_GET["intent"])) {
	header("Location: /?error&message=No intent provided");
	die();
}

$intent_name = $_GET["intent"];

?>
<!DOCTYPE html>
<html>
	<head>
		<meta name="charset" content="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

		<title> Jarvis - Choose Slot </title>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/slot-choose.css">
		<link rel="stylesheet" href="/assets/css/index.css">
		
		<script src="/assets/js/files/slot-choose.js" defer></script>
		<script src="/assets/js/classes/HTTP.js" defer></script>
		<script src="/assets/js/classes/Alerts.js" defer></script>
		<script src="/assets/js/classes/JarvisNLU.js" defer></script>
		<script src="/assets/js/classes/JarvisStatus.js" defer></script>
		<script src="/assets/js/main.js" defer></script>
	</head>

	<body>
		<?php echo $nav ?>


		<h1> <i>queue</i> Choose Slot for <?php echo $intent_name ?> </h1>



		<div class="main-container">
			<div class="buttons">
				<button class="iconbutton" onclick="window.location.href='/slot/add?returnUri='+window.location.href.split(window.location.hostname)[1]"> <i>add</i> Create new Slot </button>
				<button class="iconbutton" onclick="window.location.href='/intent/edit?name=<?php echo $intent_name ?>'"> <i>keyboard_backspace</i> Back </button>
			</div>

			<?php if (count($skills["slots"]) == 0): ?>
				<p> You haven't created a slot yet. <br> Improve your assistant by <a href="/slot/add?returnUri=/slot/choose?intent=<?php echo $_GET["intent"] ?>">creating one</a> </p>
			<?php else: ?>
				<div class="slots skills">
				<?php foreach ($skills["slots"] as $slot => $data): ?>
					<div class="slot skill" data-slot="<?php echo $slot ?>">
						<i class="invisible red" title="Delete slot">delete</i>
						<span class="name"> <?php echo $slot ?> </span>
						<span class="data"> <?php echo count($data["data"]) ?> datasets </span>
					</div>
				<?php endforeach; ?>
				<?php for ($i = 0; $i < 4 - (count($skills["slots"]) % 4); $i++): ?>
					<div class="slot skill filler" style="visibility:hidden"></div>	
				<?php endfor; ?>
				</div>
			<?php endif; ?>
		</div>

		<?php displaySideBar(); ?>
<?php displayFooter(); ?>

	</body>
</html>