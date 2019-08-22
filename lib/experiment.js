const debug = false;

const VIDEO_BASE_URL = 'ressources/mp4/';
const VIDEOS_PER_USER = 1;

let videos_displayed = 0;

function run_experiment(videos){ //called after get_videos finished retrieving video IDs from server
    let intro_trial = {
        type: 'html-keyboard-response',
        stimulus: `<p>Thank you for your interest!</p>
        <p>In the following task, you will be asked to assess ${VIDEOS_PER_USER} videos of a robot
            displaying emotions as a combination of two independent variables <b>valence</b> (i.e. pleasantness) and <b>arousal</b> (i.e. intensity). For each video, select how you perceive the displayed emotion by clicking anywhere on the grid that appears after the animation ends.</p>
        
        <table class='valencearousal-description'><tr>
                <td>valence:</td>
                <td>Pleasantness of a given emotion, i.e. ranging from very<br> positive/happy to very negative/unhappy.</td>
        </tr><tr>
                <td>arousal:</td>
                <td>Excitation, intensity of a given emotion, i.e. ranging from<br> active/excitable to passive/calm.</td>
        </tr></table>
        
        <p>You will see each video only once. A fixation cross is displayed before the start of each video.
            If you're unsure about your rating, adjust the confidence slider at the bottom to a value that seems appropriate to you.</p>
        <p>Press any key to begin.</p>`,
    };

    let instruction_trial = {
        type: 'instructions',
        pages: instruction_texts,
        allow_keys: true,
        show_clickable_nav: true
    }

    let consent_trial = {
        type: 'html-button-response',
        stimulus: consent_html,
        choices: ['No I do not wish to participate', '<b>Yes, I do wish to participate</b>'],
    };
    
    let goodbye_trial = {
        type: 'html-keyboard-response',
        stimulus: `<p>Thank you! Your responses have been collected.</p>
        <p>You can now close this window or <a href="https://www.prolific.co/">go back to prolific</a>`,
        on_start: function(){
            let data = jsPsych.data.get().filter({trial_type: 'grid-response'})
                .ignore('internal_node_id')
                .ignore('trial_type')
                .ignore('trial_index');
            let prolific_id_response = JSON.parse(jsPsych.data.get().last(1).values()[0]['responses']);
            saveData(data.csv(), prolific_id_response['Q0']); //permanently save data in a separate CSV file
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
        debug: debug,
        video_id: jsPsych.timelineVariable('id'),
        data: {trial_in_session: function(){ return ++videos_displayed }},
    };
    
    let rating_procedure = {
        timeline: [fixation,show_video,rate_video],
        timeline_variables: videos,
        randomize_order: true,
    };

    let prolific_input = {
        type: 'survey-text',
        questions: [
            {prompt: "Optional: if you came here from prolific, please enter your prolific ID below:",
            columns: 24}, 
        ],
      };

    let main_experiment = {
        conditional_function: function(){
            let data = jsPsych.data.get().last(1).values()[0]; //response from consent form
            response = data['button_pressed'];
            
            return response; //1 if consent, else 0
        },
        timeline: [intro_trial, rating_procedure, prolific_input, goodbye_trial],
    };
    
    let timeline = [
        instruction_trial,
        consent_trial,
        main_experiment,
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
    xhr.open('GET', `php/get_videos.php?n=${n}`);
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
function saveData(data, prolific_id){
    let xhr = new XMLHttpRequest();
    xhr.open('POST', 'php/save_results.php');
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
        results: data,
        prolific_id: prolific_id,
    }));
}

get_videos(VIDEOS_PER_USER);