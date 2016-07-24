<?php
	if (isset($_GET['sn'])) {
		require_once('TwitterAPIExchange.php');

		$sn = $_GET['sn'];

		$settings = array(
			// 'oauth_access_token' => "3097210376-uhuX1Gip1QEYOWVBXTp8z6UK76eviB2R7APKZ8R",
			// 'oauth_access_token_secret' => "Ftc9cgwUuAcm99aD7yfT2gWWPM84uA3qOsUav4EMX6ymB",
			// 'consumer_key' => "SiDTZkkVshISY4iZyh8oGgOWS",
			// 'consumer_secret' => "yG6ZCaH6IFxao3Y5MaZrcqSWJi8Lv8XPUmG2XzVut578qWNcib"
			'oauth_access_token' => "710597896689700864-bdpcsNiZOSOFt6nAKvvc1pQhlAv8dP8",
			'oauth_access_token_secret' => "iZHB91P4Ut9NxWxGVBKtGPrw0FbbQ0lKJkwBdr9nDk2cE",
			'consumer_key' => "6CXTmBJ8Z87vt9X1ACyZ0OF0b",
			'consumer_secret' => "EPjPfE0zJHk6V3lZ8dFr7XBbGaVPYQjCFZSV6SlqezMQ0vYRrr"
		);

		$url = "https://api.twitter.com/1.1/users/show.json";

		$requestMethod = "GET";

		$getfield = '?screen_name='.$sn;
		 
		$twitter = new TwitterAPIExchange($settings);
		 
		// $r = json_decode($twitter->setGetfield($getfield)
		//                ->buildOauth($url, $requestMethod)
		//                ->performRequest(),$assoc = TRUE);

		$r = $twitter->setGetfield($getfield)
		               ->buildOauth($url, $requestMethod)
		               ->performRequest();

		echo($r);

		// echo json_encode($r);

	}
?>