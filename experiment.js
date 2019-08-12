const debug = true;

const VIDEO_BASE_URL = 'ressources/mp4/';
const VIDEOS_PER_USER = 1;

let videos_displayed = 0;

function get_videos(n=10){
    let min=1;
    let max=348;
    let videos = [];

    for(let i=0, video_id; i<n; i++){
        videos.push({
            id: Math.floor(Math.random() * (max - min + 1)) + min
        });
    }
    
    return videos;
}

let videos = get_videos(VIDEOS_PER_USER);

let hello_trial = {
    type: 'html-keyboard-response',
    stimulus: `<p>Welcome!</p>
    <p style="width: 600px">In this task, you will be asked to rate 15 videos of a robot
        displaying emotions based on valence and arousal. You will
        only see each video once. If you're not sure about your rating,
        you can adjust the confidence slider at the bottom.</p>
    <p>Press any key to begin.</p>`,
};

let goodbye_trial = {
    type: 'html-keyboard-response',
    stimulus: `Thank you! Your responses have been collected.`,
    on_start: function(){
        let data = jsPsych.data.get().filter({trial_type: 'grid-response'})
            .ignore('internal_node_id')
            .ignore('trial_type')
            .ignore('trial_index');

        saveData(data.csv());
        console.log("Experiment finished.");
        //jsPsych.data.displayData();
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
    data: {animation_number: ++videos_displayed},
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

/* needs configured server to run */
function saveData(data){
    var xhr = new XMLHttpRequest();
    xhr.open('POST', 'save_results.php'); // 'write_data.php' is the path to the php file described above.
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({results: data}));
} 

jsPsych.init({
    timeline: timeline,
});