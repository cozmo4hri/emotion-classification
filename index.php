<?php 
    $redirect = "Location: /site.html";
    $uri_params = explode("/",$_SERVER['REQUEST_URI']);

    if( strlen($uri_params[1]) > 0 ) {
        $redirect .= ("?pid=" . $uri_params[1]);
    }
    header($redirect); 
?>
Server not running!