const debug = true;

const VIDEO_BASE_URL = 'ressources/mp4/';
const VIDEOS_PER_USER = 5;

function run_experiment(videos){ //called after get_videos finished retrieving video IDs from server
    let videos_displayed = 0;

    let hello_trial = {
        type: 'html-keyboard-response',
        stimulus: `<p>Welcome!</p>
        <p style="width: 600px">In this task, you will be asked to rate 15 videos of a robot
            displaying emotions based on valence and arousal. You will
            only see each video once. If you're not sure about your rating,
            you can adjust the confidence slider at the bottom.</p>
        <p>Press any key to begin.</p>`,
    };

    if(debug){
        hello_trial.stimulus += `<p><b>Videos: ${videos}</b></p>`;
    }
    
    let goodbye_trial = {
        type: 'html-keyboard-response',
        stimulus: `Thank you! Your responses have been collected.`,
        on_start: function(){
            let data = jsPsych.data.get().filter({trial_type: 'grid-response'})
                .ignore('internal_node_id')
                .ignore('trial_type')
                .ignore('trial_index');
    
            saveData(data.csv()); //permanently save data in a separate CSV file
            console.log("Experiment finished.");
        }
    };
    
    let fixation = { //fixation cross
        type: 'html-keyboard-response',
        stimulus: '<div style="font-size:52px;">+</div>',
        choices: jsPsych.NO_KEYS,
        trial_duration: function(){
            return debug ? 150 : 1500; //1.5s
        },
        data: {test_part: 'fixation'}
    }
    
    let show_video = {
        type: 'video-keyboard-response',
        sources: function(){
            let vid_id = jsPsych.timelineVariable('id', true);
            return [VIDEO_BASE_URL + vid_id +".MOV.mp4"]
        },
        prompt: function(){
            return "Video ID: #"+jsPsych.timelineVariable('id', true)
        },
        width: "67%",
        response_ends_trial: debug, //videos can be skipped if debug is set to true
        trial_ends_after_video: true,
    }
    
    let rate_video = {
        type: 'grid-response',
        video_id: jsPsych.timelineVariable('id'),
        debug: debug,
        data: {trial_in_session: ++videos_displayed} //TODO: This isn't working!
    };
    
    let rating_procedure = {
        timeline: [fixation,show_video,rate_video],
        timeline_variables: videos,
        randomize_order: true,
    }
    
    let timeline = [
        hello_trial,
        rating_procedure,
        goodbye_trial,
    ];

    jsPsych.init({
        timeline: timeline,
        on_finish: function() {
            if(!debug)
                return;
            jsPsych.data.displayData();
        }
    });
}

//sends a HTTP request to the server to get a list of selected videos (videos of different categories that haven't been rated much)
function get_videos(n=10){
    let xhr = new XMLHttpRequest();
    xhr.open('GET', 'php/get_videos.php');
    xhr.send();

    xhr.onload = function() {
        if (xhr.status != 200) { //error
            console.log(`Error ${xhr.status}: ${xhr.statusText}`); // e.g. 404: Not Found
        } 
        else {
            console.log(`Done, got ${xhr.response.length} bytes`);
            
            let responseObj = xhr.response;
            let video_ids = JSON.parse(responseObj);

            console.log(video_ids);
            
    
            let videos = [];
            for(let i=0; i<video_ids.length; i++){
                videos.push({
                    id: video_ids[i],
                    toString: function(){ return video_ids[i] },
                });
            }
            
            run_experiment(videos);
        }
    };
    xhr.onerror = function() {
        alert("XHR error - failed to retrieve video IDs");
    };
}

/* needs PHP server to run */
function saveData(data){
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'php/save_results.php');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({results: data}));
} 

get_videos(VIDEOS_PER_USER);