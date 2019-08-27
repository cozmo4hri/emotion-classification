jsPsych.plugins['grid-response'] = (function(){
    let plugin = {};

    plugin.info = {
        name: 'grid-response',
        parameters: {
            video_id: {
                type: jsPsych.plugins.parameterType.INT,
                pretty_name: 'Video ID',
                default: undefined, //This means video_id needs to be set in each trial
                description: 'The id of the video to be classified.'
            },
            confirm_text: {
                type: jsPsych.plugins.parameterType.STRING,
                pretty_name: 'Label for the continue button',
                default: 'Confirm',
            },
            debug: {
                type: jsPsych.plugins.parameterType.BOOLEAN,
                default: false,
            }
        }
    }

    plugin.trial = function(display_element, trial){
        let end_trial = function(){
            
            jsPsych.finishTrial({
                video_id: trial.video_id,
                valence: valence, //between -1 and 1
                arousal: arousal, //between -1 and 1
                confidence: confidence, //between 0 and 1
            });
        }

        let done_btn = `<button id="continue-button" class="cont-button">${trial.confirm_text}</button>`;
        let grid_input_container_html = `
        <div class="grid-label">high arousal</div>
        <div class="flex">
        <div class="grid-label grid-input-label-left">low valence</div>
        <div id="grid-input-container">
            <div id="grid-input-pos-indicator"></div>
        </div>
        <div class="grid-label grid-input-label-right">high valence</div>
        </div>
        <div class="grid-label">low arousal</div>
        `;

        let confidence_slider = `
            <label id="confidence-slider-label">Confidence: 
            <input type="range" id="confidence-slider" class="thumb-hidden" min="0" max="100" value="100">
            <div id="conf-label"><span id="conf-val">__</span>%</div>
            </label>`;

        html = `<p>Please select appropriate levels of valence and arousal for video ${trial.video_id}.</p>` + grid_input_container_html + confidence_slider + done_btn;

        let confidence, valence, arousal, x, y;

        display_element.innerHTML = html;

        let indicator_has_been_placed = false; //has been placed at least once
        let indicator_is_visible = false;
        let conf_has_been_selected = false;

        const grid_container = display_element.querySelector('#grid-input-container');
        const pos_indicator = grid_container.querySelector('#grid-input-pos-indicator');
        const continue_button = display_element.querySelector('#continue-button');

        const conf_val = display_element.querySelector('#conf-val');
        const conf_slider = display_element.querySelector('#confidence-slider');

        const containerSize = grid_container.clientHeight;
        const indicatorSize = pos_indicator.clientHeight / 2;

        if(trial.debug){ //easily skip trials if in debug mode
            continue_button.addEventListener('click', end_trial);
        }

        grid_container.addEventListener('mousemove', e => {
            const rect = grid_container.getBoundingClientRect(); //needs to be recalculated in case browser was resized
            x = e.clientX - Math.round(rect.left);
            y = e.clientY - Math.round(rect.top);

            if(!indicator_is_visible){
                indicator_is_visible = true;
                pos_indicator.className += 'visible ';   
            }

            if(indicator_has_been_placed)
                return;

            pos_indicator.style.top = Math.min(Math.max(y, indicatorSize), containerSize-indicatorSize) + 'px';
            pos_indicator.style.left = Math.min(Math.max(x, indicatorSize), containerSize-indicatorSize) + 'px';
        });

        grid_container.addEventListener('click', e => {
            const rect = grid_container.getBoundingClientRect(); //needs to be recalculated in case browser was resized
            indicator_has_been_placed = true;
            pos_indicator.className += " placed";

            x = e.clientX - Math.round(rect.left);
            y = e.clientY - Math.round(rect.top);

            valence = (x/containerSize * 2 - 1).toFixed(2);
            arousal = (-(y/containerSize)*2+1).toFixed(2);
            console.log(`UPDATED: valence: ${valence}, arousal: ${arousal})`);

            pos_indicator.style.top = Math.min(Math.max(y, indicatorSize), containerSize-indicatorSize) + 'px';
            pos_indicator.style.left = Math.min(Math.max(x, indicatorSize), containerSize-indicatorSize) + 'px';

            //if both confidence and grid have been selected, enable continue button
            if(!conf_has_been_selected)
                return;
                
            continue_button.addEventListener('click', end_trial);
            continue_button.className += " enabled";
        });

        conf_slider.addEventListener('input', e => {
            conf_slider.className = ''; //remove .thumb-hidden class

            conf_val.innerHTML = conf_slider.value;
            confidence = conf_val.innerHTML / 100;

            conf_has_been_selected = true;

            //if both confidence and grid have been selected, enable continue button
            if(!indicator_has_been_placed)
                return;

            continue_button.addEventListener('click', end_trial);
            continue_button.className += " enabled";
        });
    }

    return plugin;
})();