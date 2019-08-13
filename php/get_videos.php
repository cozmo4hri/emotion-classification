<?php
    /*
    Algorithm draft:
    0) p=0
    1) select all videos that have been rated p times
    2) try to find random videos from n different categories => done
    3) if not possible, add videos to selection that have been rated ++p times
    4) go back to 2)
    */

    $n = intval($_GET["n"]);
    
    $video_ids = [];

    for($i = 0; $i<$n; $i++){
        array_push($video_ids, $i+1);
    }

    echo json_encode($video_ids);
?>