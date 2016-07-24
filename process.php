<?php
	if (isset($_POST['data'])) {
		$data = "[" . $_POST['data'] . "]";
		$data = json_decode($data);

		echo "<pre>";
		print_r($data);
	}
?>