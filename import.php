<?php

if (!isset($_FILES["upload"])) {
	header("Location: /?error&message=No files provided for upload");
	die();
}

header("Content-Type:text/plain");

$files = $_FILES["upload"];

$errors = [];

require $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";

for ($i = 0; $i < count($files["name"]); $i++) {

	$f = [
		"name"		=> $files["name"][$i],
		"type"		=> $files["type"][$i],
		"tmp_name"	=> $files["tmp_name"][$i],
		"error"		=> $files["error"][$i],
		"size"		=> $files["size"][$i]
	];

	$path = "assets/uploads/" . $f["name"];
	if (move_uploaded_file($f["tmp_name"], $path)) {
		$s = json_decode(file_get_contents($path), true);
		if (json_last_error() == JSON_ERROR_NONE) {
			
			// perform checks to see if it's actually a valid skill file
			if (isset($s["skills"], $s["slots"])) {
				if (count($s["skills"]) > 0) {
					
					##################### ACTUAL IMPORT STARTING HERE!

					$new_skills = array_replace_recursive ($s["skills"], $skills["skills"]);
					$skills["skills"] = $new_skills;

					$new_slots = array_replace_recursive ($s["slots"], $skills["slots"]);
					$skills["slots"] = $new_slots;

					writeSkills();

					// file_put_contents("merged-skills.json", json_encode($skills, JSON_PRETTY_PRINT));

					##################### IMPORT ENDING HERE

				} else {
					$errors[$f["name"]] = "Empty skill file";
					continue;
				}
			} else {
				$errors[$f["name"]] = "Not a valid skill file";
				continue;
			}

		} else {
			header("Location: /?error&message=" . json_last_error_msg());
			die();
		}
	} else {
		header("Location: /?error&message=Failed to upload file " . $f["name"]);
		die();
	}
}

if (count($errors) > 0) {
	$errStr = "";
	foreach ($errors as $fn => $str) {
		$errStr .= "<br><br>$fn: $str";
	}
	header("Location: /?error&message=Couldn't import some files/skills:" . $errStr);
	die();
} else {
	header("Location: " . $_SERVER['HTTP_REFERER']);
	die();
}

?>