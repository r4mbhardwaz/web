<?php 

if (!isset($_GET["name"])) {
	header("Location: /?error&message=No slot name defined");
	die();
}

require_once $_SERVER['DOCUMENT_ROOT'] . "/assets/php/main.php";

$edit = true;
$slot_name = $_GET["name"];

if (!isset($skills["slots"][$slot_name])) {
	header("Location: /slot/add");
	die();
}

require $_SERVER['DOCUMENT_ROOT'] . "/slot/add.php";
 
?>