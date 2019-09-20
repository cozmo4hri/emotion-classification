<?php
    $post_data = json_decode(file_get_contents('php://input'), true);
    $csv_data = $post_data['results'];
    $prolific_id = $post_data['prolific_id'];

    //step 1: save the user input into a new csv file
    $base_url = "../data/%s.csv";
    $filename = date('Y-m-d_G:i:s') . "_"; //UTC time!

    if ( strlen($prolific_id) > 0 ){ //prolific ID provided
        $filename .= $prolific_id;
    } else {
        $filename .= "internal";
        $filename .= substr(uniqid(), 0, 16); //add random number instead
    }

    $file_url = sprintf($base_url, $filename);
    
    error_log($prolific_id);
    error_log($filename);

    //write the file to disk
    file_put_contents($file_url, $csv_data);

    //===============================================

    /* step 2: update the number of ratings of the
    displayed videos in the video_ratings.csv file.*/

    /*
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
        $line_exploded = explode(',', $line); //explode the line into it's comma-separated parts
        $times_viewed = intval( $line_exploded[2] ) + 1; //note the +1
        $line_exploded[2] = strval($times_viewed); //update the value in the line
        
        $file_lines[$vid_id] = implode(",", $line_exploded); //update the line in the array
    }

    $updated_file_str = implode(PHP_EOL, $file_lines); //concatenate the lines to a big string again
    file_put_contents($vid_ratings_url, $updated_file_str); //write the new string to the file

    */
    /* What we do here is read the entire file (only 8KB, at least),
    change some lines and then write it completely from scratch.
    This process could be streamlined in the future by using a DB */