<?php 

require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";

if (isset($_GET["addNewUser"])) {
	$response = [
		"ok" => false,
		"message" => "An unknown error occured!"
	];

	$users = json_decode(file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/database/users.json"), true);

	if (isset($_GET["user"])) {
		if (isset($users[$_GET["user"]])) {
			$response["message"] = "Username already exists";
		} else {
			$users[$_GET["user"]] = "firstlogin";
			file_put_contents($_SERVER["DOCUMENT_ROOT"] . "/database/users.json", json_encode($users));
			$response["ok"] = true;
			$response["message"] = "Successfully created new user!";
		}
	} else {
		$response["message"] = "No username was provided";
	}

	header("Content-Type: application/json");
	die(json_encode($response));
}
if (isset($_GET["deleteUser"])) {
	$response = [
		"ok" => false,
		"message" => "An unknown error occured!"
	];

	$users = json_decode(file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/database/users.json"), true);

	if (isset($_GET["user"])) {
		if (isset($users[$_GET["user"]])) {
			unset($users[$_GET["user"]]);
			$response["ok"] = true;
			$response["message"] = "Successfully deleted user!";
			file_put_contents($_SERVER["DOCUMENT_ROOT"] . "/database/users.json", json_encode($users));
		} else {
			$response["message"] = "Username doesn't exist";
		}
	} else {
		$response["message"] = "No username was provided";
	}

	header("Content-Type: application/json");
	die(json_encode($response));
}
if (isset($_GET["changePassword"])) {
	$response = [
		"ok" => false,
		"message" => "An unknown error occured!"
	];

	$users = json_decode(file_get_contents($_SERVER["DOCUMENT_ROOT"] . "/database/users.json"), true);

	if (isset($_GET["user"], $_GET["pass"])) {
		if (isset($users[$_GET["user"]])) {
			$users[$_GET["user"]] = $_GET["pass"];
			$response["ok"] = true;
			$response["message"] = "Successfully changed password!";
			file_put_contents($_SERVER["DOCUMENT_ROOT"] . "/database/users.json", json_encode($users));
		} else {
			$response["message"] = "Username doesn't exist";
		}
	} else {
		$response["message"] = "No username/password was provided";
	}

	header("Content-Type: application/json");
	die(json_encode($response));
}


?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Jarvis - Users</title>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/users.css">

		<script src="/assets/js/files/users.js" defer></script>
		<script src="/assets/js/classes/HTTP.js" defer></script>
		<script src="/assets/js/classes/Alerts.js" defer></script>
		<script src="/assets/js/classes/JarvisNLU.js" defer></script>
		<script src="/assets/js/classes/JarvisStatus.js" defer></script>
		<script src="/assets/js/main.js" defer></script>
	</head>

	<body>
		<?php echo $nav; ?>


		<h1>Users</h1>


		<div class="main-container">
			<p>Manage users who will be able to log into the Jarvis Web UI</p>

			<div class="users">
				<div class="user first">
					<span>Username</span>
					<span>Password</span>
					<span>Delete user</span>
					<span></span>
				</div>
				
				<?php 
				$users = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/database/users.json"), true);
				foreach ($users as $u => $p) { ?>
					
					<div class="user" data-user="<?php echo $u ?>">
						<span><?php echo $u ?></span>
						<input type="text" value="<?php echo $p ?>">
						<button class="iconbutton" onclick="deleteUser(this.parentElement.dataset.user, this.parentElement.children[3])"> <i>delete</i> Delete </button>
						<span></span>
					</div>

				<?php } ?>

				<div class="user new">
					<button class="iconbutton" onclick="launchInput(addNewUser, 'New username', 'Enter the username for your new user.')"> <i>add</i> Add a User </button>
					<span id="message"></span>
					<span></span>
					<span></span>
				</div>
			</div>
		</div>

		<div id="append-your-dom-elements-here"></div>
	</body>
</html>