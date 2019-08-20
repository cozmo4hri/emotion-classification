<?php
    /*
    Algorithm draft:
    0) p=0
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

    $selected_videos = []; //videos sent to the client
    $groups_found = []; //groups that are represented by a video already

    $p = 0; //Max times a video can be rated to be considered for this trial.

    while (count($selected_videos) < $number_of_videos){
        foreach ($videos as $video){
            $video_id = intval($video[0]);
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
                echo json_encode($selected_videos);
                exit();
            }
        }
        
        $p++;
    }