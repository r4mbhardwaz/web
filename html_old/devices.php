<?php 
require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";


if (isset($_GET["getTable"])) {
	$data = json_decode(file_get_contents('php://input'), true);
	$options = array(
		'http' => array(
			'header'  => "Content-type: application/json\r\nContent-Length: " . count(unpack('C*', json_encode($data))) . "\r\n",
			'method'  => 'POST',
			'content' => json_encode($data)
		)
	);
	$context = stream_context_create($options);
	$devices = json_decode(@file_get_contents("http://localhost:2021/get-devices", false, $context), true);

	if ($devices["success"]) {
		$devices = $devices["devices"];
	} else {
		echo "Permission denied by Jarvis backend";
		die();
	}

	if (count($devices) == 0) {
		echo "No connected devices";
	}

	// function sortDevices($a, $b) {
	// 	return strcmp($a['status'], $b['status']);
	// }
	// usort($devices, 'sortDevices');

	$permissions = [
		1 => "Dumb Device",
		2 => "Scanner",
		3 => "End Device",
		4 => "Admin Device",
		5 => "Token Master"
	];

	foreach ($devices as $token => $device) {
		$name = $device["name"];
		$ip = $device["ip"];
		$type = ucfirst($device["type"]);
		$typeIcon = getIconForDeviceType($device["type"]);
		$status = $device["status"];
		$connection = ucfirst($device["connection"]);
		$connectionIcon = getIconForConnectionType($device["connection"]);
		$permission = $permissions[$device["permission-level"]];
		// $token = $device["id"];

		$lastSeen = time() - $device["last-active"] < 20 ? "Just now" : explode(" ", secondsToTime(time() - $device["last-active"]))[0] . " ago";

		echo "<tr><td>$name</td><td>$ip</td><td><span class='valign'>$type<i>$typeIcon</i></span></td><td><span class='valign'>$connection<i>$connectionIcon</i></span></td><td>$permission</td><td><span class='$status'>$lastSeen</span></td><td><button class='iconbutton delete-device' data-token='$token'><i>delete</i>Remove</button></td></tr>";
	}
	die(); 
}
?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Jarvis - Devices</title>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/devices.css">
		<link rel="stylesheet" href="/assets/css/log.css"> <!-- table design -->

		<script src="/assets/js/classes/HTTP.js" defer></script>
		<script src="/assets/js/classes/Alerts.js" defer></script>
		<script src="/assets/js/classes/JarvisNLU.js" defer></script>
		<script src="/assets/js/classes/JarvisStatus.js" defer></script>
		<script src="/assets/js/files/devices.js" defer></script>
		<script src="/assets/js/main.js" defer></script>
		<script src="/assets/js/jquery-3.5.1.min.js" defer></script>
		<script src="/assets/js/qrcode.js" defer></script>
	</head>

	<body>
		<?php echo $nav; ?>

		<h1>Devices</h1>

		<div class="main-container">
			<p>Manage connected devices</p>

			<div class="buttons">
				<button class="iconbutton" id="new-device"> <i>add</i> Add device </button>
			</div>

			<table>
				<thead>
					<tr>
						<td>Device Name</td>
						<td>IP Address</td>
						<td>Type</td>
						<td>Connection</td>
						<td>Permission-Level</td>
						<td>Last seen</td>
						<td></td>
					</tr>
				</thead>
				<tbody id="tbody">
					<tr>
						<td colspan="5"> No connected devices </td>
					</tr>
				</tbody>
			</table>
		</div>

		<div id="append-your-dom-elements-here"></div>

		<?php 
		displaySideBar();
		displayFooter();
		?>
	</body>
</html>