<?php
    $post_data = json_decode(file_get_contents('php://input'), true);
    $data = $post_data['results'];
    
    $base_url = "data/%s.csv";
    $filename = date('Y-m-d_G:i:s'); //UTC time!
    $file_url = sprintf($base_url, $filename);
    
    //write the file to disk
    file_put_contents($file_url, $data);
?>