<?php
    $post_data = json_decode(file_get_contents('php://input'), true);
    $csv_data = $post_data['results'];
    
    //step 1: save the user input into a new csv file
    $base_url = "../data/%s.csv";
    $filename = date('Y-m-d_G:i:s'); //UTC time!
    $file_url = sprintf($base_url, $filename);
    
    //write the file to disk
    file_put_contents($file_url, $csv_data);

    /* step 2: update the number of ratings of the
    displayed videos in the video_ratings.csv file.*/
    
    $data_lines = explode(PHP_EOL, $csv_data); //split string into lines
    array_shift($data_lines); //remove first line

    $vid_ratings_url = "../video_ratings.csv";
    $file_str = file_get_contents($vid_ratings_url);

    $file_lines = explode(PHP_EOL, $file_str);

    //assume that video_id is in column 0 (*shouldn't* change)
    foreach($data_lines as $grid_entry_line){
        if(strlen($grid_entry_line) == 0) //empty line (last line)
            continue;

        $vid_id = intval( str_replace( '"', '', explode(',', $grid_entry_line)[0] ) ); //I hate PHP
        
        $line = $file_lines[$vid_id];
        $line_exploded = explode(',', $line);
        $times_viewed = intval( $line_exploded[2] ) + 1; //note the +1
        $line_exploded[2] = strval($times_viewed);
        
        $file_lines[$vid_id] = implode(",", $line_exploded); //update the line
    }

    $updated_file_str = implode(PHP_EOL, $file_lines);
    file_put_contents($vid_ratings_url, $updated_file_str);

    /* What we do here is read the entire file (only 8KB, at least),
    change some lines and then write it completely from scratch.
    This process could be streamlined in the future by using a DB */