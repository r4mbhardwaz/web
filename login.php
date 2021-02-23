<?php 

require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";
$error = false;


if (isset($_GET["logout"])) {
	unset($_SESSION["logged_in"]);
	header("Location: /login");
	die();
}

if (isset($_SESSION["logged_in"])) {
	if (isset($_SESSION["returnUri"])) {
		header("Location: " . $_SESSION["returnUri"]);
		die();
	} else {
		header("Location: /");
		die();
	}
}

if (isset($_POST["login"])) {
	$user = $_POST["user"];
	$pass = $_POST["pass"];

	$usersdb = json_decode(file_get_contents($_SERVER['DOCUMENT_ROOT'] . "/database/users.json"), true);

	if (isset($usersdb[$user])) {
		if ($usersdb[$user] === $pass) {
			$_SESSION["logged_in"] = $user;
			if (isset($_SESSION["returnUri"])) {
				header("Location: " . $_SESSION["returnUri"]);
				die();
			} else {
				header("Location: /");
				die();
			}
		} else {
			$error = "The given username/password pair doesn't exist";
			sleep(1);
		}
	} else {
		$error = "This username doesn't exist";
		sleep(1);
	}
}


?>

<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Jarvis - Login</title>

		<link rel="stylesheet" href="/assets/css/main.css">
		<link rel="stylesheet" href="/assets/css/login.css">
	</head>

	<body>
		<?php echo $nav; ?>


		<h1>Login</h1>


		<form class="main-container" action="/login" method="post">
			<?php if ($error !== false): ?>
				<p> <span class="red"><?php echo $error; ?></span><br><br>Log in to access the Jarvis Web UI:</p>
			<?php else: ?>
				<p>Log in to access the Jarvis Web UI:</p>
			<?php endif; ?>
			

			<input type="text" name="user" placeholder="Username" required>
			<input type="password" name="pass" placeholder="Password" required>

			<button type="submit" name="login" class="green">Log in</button>
		</form>
	</body>
</html>