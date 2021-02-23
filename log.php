<?php
require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";

if (isset($_GET["compress"])) {
	$file = $logfile;
	$date = $date = date('d-m-Y_h-i-s', time());
	$gzfile = "$logfile" . "_$date.gz";
	$fp = gzopen ($gzfile, 'w9');
	gzwrite ($fp, file_get_contents($file));
	gzclose($fp);
	file_put_contents($logfile, "");
	header("Location: /log");
	die();
}
if (isset($_GET["fetch"])) {
	$file = file($logfile);
	$file = array_reverse($file);
	
	$log = [];
	foreach($file as $line){
		preg_match_all("(\[[^\]]+\])", $line, $matches);
		
		$e = explode("]", $line);

		if (count($matches[0]) == 2) {
			$log[] = [
				str_replace("]", "", str_replace("[", "", $matches[0][0])),
				str_replace("]", "", str_replace("[", "", $matches[0][1])),
				trim(end($e))
			];
		} else {
			$log[] = [
				str_replace("[", "", $e[0]),
				str_replace("[", "", $e[1]), 
				trim(str_replace("]]", "", str_replace($e[0], "", str_replace($e[1], "", $line))))
			];
		}

	}

	echo json_encode($log);
	die();
}
?>

<!DOCTYPE html>
<html>
	<head>
		<meta name="charset" content="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">

		<title> Jarvis - Log </title>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/log.css">

		<script src="/assets/js/files/log.js" defer></script>
		<script src="/assets/js/classes/HTTP.js" defer></script>
		<script src="/assets/js/classes/Alerts.js" defer></script>
		<script src="/assets/js/classes/JarvisNLU.js" defer></script>
		<script src="/assets/js/classes/JarvisStatus.js" defer></script>
		<script src="/assets/js/main.js" defer></script>
		<script src="/assets/js/jquery-3.5.1.min.js"></script>
		<script src="/assets/js/jquery.tablesorter.min.js"></script>
	</head>

	<body>
		<?php echo $nav ?>


		<h1>
			<i>rss_feed</i> Log
			<button class="iconbutton text blue" id="export-skills" onclick="window.location.href='/log?compress'"> <i>archive</i> <span>Archive log</span> </button>
		</h1>


		<div class="main-container">
			<table id="log">
				<thead>
					<tr>
						<td>Timestamp <i class="up">keyboard_arrow_up</i> <i class="down">keyboard_arrow_down</i> </td>
						<td>Type <i class="up">keyboard_arrow_up</i> <i class="down">keyboard_arrow_down</i> </td>
						<td>Message <i class="up">keyboard_arrow_up</i> <i class="down">keyboard_arrow_down</i> </td>
						<input id="search" class="noshadow" onkeyup="searchTable(this.value)" placeholder="Search...">
					</tr>
				</thead>
				<tbody>
					<tr>
						<td><div class="loader"></div></td>
						<td><div class="loader"></div></td>
						<td><div class="loader"></div></td>
					</tr>
				</tbody>
				<div id="statistics"></div>
			</table>

			<div id="filter-buttons">
				<button onclick="toggleFilter('http', this)" class="active"> HTTP </button>
				<button onclick="toggleFilter('voa', this)" class="active">  VoA  </button>
				<!-- <button onclick="filter('http')">HTTP</button> -->
			</div>
		</div>

		<script>
		function searchTable(term) {
			if (term == "") {
				$("tbody td").filter(function() {
					return 1;
				}).parent().show();
				return;
			}
			
			// hide all
			$("tbody td").filter(function() {
				return 1;
			}).parent().hide();
			
			// show hits
			$("tbody td").filter(function() {
				return $(this).text().indexOf(term) !== -1;
			}).parent().show();
		}
		function makeSortable() {
			$("#log").tablesorter();
		}
		makeSortable();
		</script>

		<?php displaySideBar(); ?>
		<?php displayFooter(); ?>
	</body>
</html>