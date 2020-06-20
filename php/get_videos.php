<?php
    /*
    This PHP script is called when a new user takes part in the study. The goal is to choose at most 1 video per category, and choose only such videos that require more ratings by the users. At the end, all videos should have been seen by approximately the same number of participants, and each participant should see a video from a new category for each video they see. Due to balancing contraints between these two considerations, some videos will have been seen by more than the minimum required amount of participants!

    Algorithm draft:
    0) let p=0
    1) select all videos that have been rated p times
    2) try to find random videos from n different categories => done
    3) if not possible, add videos to selection that have been rated ++p times
    4) go back to 2)
    */

    $number_of_videos = intval($_GET["n"]); //total number of videos that need to be found
    
    //read csv file containing the videos, their group and their total ratings
    $video_file = file('../video_ratings.csv');
    $videos = array_map('str_getcsv', $video_file);
    array_shift($videos); //remove first line

    $selected_videos = []; //videos that will be sent to the client at the end
    $groups_found = []; //groups that are represented by a video already. The aim is to have no more than 1 video per category.

    $p = 0; /*Max times a video can be rated to be considered for this trial. Set to 0 at first,
    which means: Try to find videos that have never been shown to anyone before. If not enough
    videos are found that fulfill this criteria, p is incremented by one, until enough videos 
    have been selected for the participant. */

    while (count($selected_videos) < $number_of_videos){
        foreach ($videos as $video){
            $video_id = intval($video[0]); //I miss python
            $video_group = $video[1];
            $video_times_rated = intval($video[2]);

            /* Skip video if it has already been rated more than p times
            or its group is already in the list of selected videos. 
            $video_times_rated != $p || ... would have the same effect here. */
            if ($video_times_rated >= $p || in_array($video_group, $groups_found)){
                continue;
            }

            //Add this video to the list of video IDs shown to the participant:
            array_push($selected_videos, $video_id);

            //Add the group of the video to the list of groups already seen:
            array_push($groups_found, $video_group);

            //if n videos have been found, return them:
            if (count($selected_videos) == $number_of_videos){

                //update number of video ratings in file:
                $vid_ratings_url = "../video_ratings.csv";
                $file_str = file_get_contents($vid_ratings_url);

                $file_lines = explode(PHP_EOL, $file_str);

                //assume that the video_id is in column 0 (*shouldn't* change)
                foreach($selected_videos as $vid_id){
                    $line = $file_lines[$vid_id];
                    $line_exploded = explode(',', $line); //explode the line into it's comma-separated parts
                    $times_viewed = intval( $line_exploded[2] ) + 1; //note the +1
                    $line_exploded[2] = strval($times_viewed); //update the value in the line
                    
                    $file_lines[$vid_id] = implode(",", $line_exploded); //update the line in the array
                }

                $updated_file_str = implode(PHP_EOL, $file_lines); //concatenate the lines to a big string again
                file_put_contents($vid_ratings_url, $updated_file_str); //write the new string to the file

                echo json_encode($selected_videos); //this sends the selected video IDs back to the client, encoded as a JSON string.
                exit();
            }
        }
        
        $p++;
    }