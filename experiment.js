// =============================
// GET PARTICIPANT INFO FROM URL
// =============================
// Get workerId from URL parameter
const urlParams = new URLSearchParams(window.location.search);
const workerId = urlParams.get('workerId');

// Generate random participant number
let participant_num = Math.floor(Math.random() * 999) + 1;
let participant_id = workerId || `participant${participant_num}`;

// Function to generate a random string for the completion code
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

const completion_code = generateRandomString(3) + 'zvz' + generateRandomString(3);

// Create filename for saving
const filename = `${participant_id}.csv`;

// =============================
// FUNCTION TO GET CLEAN CSV DATA
// =============================
function getFilteredData() {
    // Get only statement rating trials
    const ratingData = jsPsych.data.get().filter({task: 'statement_rating'});
    
    // Select only the columns we want
    const cleanData = ratingData.values().map(trial => {
        return {
            worker_id: trial.worker_id,
            participant_number: trial.participant_number,
            completion_code: trial.completion_code,
            experiment_start_time: trial.experiment_start_time,
            list_assignment: trial.list_assignment,
            trial_number: trial.trial_number,
            statement_id: trial.statement_id,
            pair_number: trial.pair_number,
            statement_type: trial.statement_type,
            statement_form: trial.statement_form,
            validity: trial.validity,
            plausibility: trial.plausibility,
            statement_text: trial.statement_text,
            rating: trial.rating,
            rt: trial.rt,
            response_time_seconds: trial.response_time_seconds
        };
    });
    
    // Convert to CSV
    if (cleanData.length === 0) return '';
    
    const headers = Object.keys(cleanData[0]);
    const csvRows = [headers.join(',')];
    
    cleanData.forEach(row => {
        const values = headers.map(header => {
            let val = row[header];
            // Handle values that might contain commas or quotes
            if (typeof val === 'string' && (val.includes(',') || val.includes('"') || val.includes('\n'))) {
                val = '"' + val.replace(/"/g, '""') + '"';
            }
            return val;
        });
        csvRows.push(values.join(','));
    });
    
    return csvRows.join('\n');
}

// =============================
// INITIALIZATION
// =============================
const jsPsych = initJsPsych({
    on_finish: function() {
        const csv = getFilteredData();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        
        document.body.innerHTML = `
            <div style="text-align: center; padding: 60px; max-width: 700px; margin: 0 auto;">
                <p style="font-size: 20px; margin-bottom: 40px;">
                    Thank you for completing the study!
                </p>
                <p style="font-size: 16px; color: #666; margin-top: 40px;">
                    You may now close this window.
                </p>
            </div>
        `;
    }
});

// Add participant info to all trials
jsPsych.data.addProperties({
    worker_id: participant_id,
    participant_number: participant_num,
    completion_code: completion_code,
    experiment_start_time: new Date().toISOString()
});

// =============================
// Timeline
// =============================
let timeline = [];

// =============================
// CONSENT FORM
// =============================
const consent = {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
        <div class="consent-text">
            <h3>Consent to Participate in Research</h3>
            
            <p>The task you are about to do is sponsored by the University of Wisconsin-Madison. It is part of a protocol titled <em>"What are we learning from language?"</em></p>

            <p>The task you are asked to do involves making simple responses to words and sentences. For example, you may be asked to rate a pair of words on their similarity or to indicate how true you think a given sentence is. More detailed instructions for this specific task will be provided on the next screen.</p>

            <p>This task has no direct benefits. We do not anticipate any psychosocial risks. There is a risk of a confidentiality breach. Participants may become fatigued or frustrated due to the length of the study.</p>

            <p>The responses you submit as part of this task will be stored on a secure server and accessible only to researchers who have been approved by UW-Madison. Processed data with all identifiers removed could be used for future research studies or distributed to another investigator for future research studies without additional informed consent from you.</p>

            <p>You are free to decline to participate, to end participation at any time for any reason, or to refuse to answer any individual question without penalty or loss of earned compensation. We will not retain data from partial responses. If you would like to withdraw your data after participating, you may email <a href="mailto:lupyan@wisc.edu">lupyan@wisc.edu</a>.</p>

            <p>If you have any questions or concerns about this task please contact the principal investigator: Prof. Gary Lupyan at <a href="mailto:lupyan@wisc.edu">lupyan@wisc.edu</a>.</p>

            <p>If you are not satisfied with the response of the research team, have more questions, or want to talk with someone about your rights as a research participant, you should contact University of Wisconsin's Education Research and Social & Behavioral Science IRB Office at 608-263-2320.</p>

            <p><strong>By clicking "I Agree" below, you consent to participate in this task and affirm that you are at least 18 years old.</strong></p>
        </div>
    `,
    choices: ['I Agree', 'I Do Not Agree'],
    on_finish: function(data) {
        if (data.response === 1) {
            jsPsych.endExperiment('You did not consent. The study has been ended. Thank you for your time.');
        }
    }
};
timeline.push(consent);

// =============================
// INSTRUCTIONS
// =============================
const instructions = {
    type: jsPsychInstructions,
    pages: [
        `<div class="instructions-content">
            <h1>Welcome to the Statement Rating Study</h1>
            <p>In this study, you will read a series of statements and rate how true or false each one is.</p>
            <p>There are no right or wrong answers. We are interested in your honest opinion about each statement.</p>
            <p style="margin-top: 40px; color: #666;">Click 'Next' to continue.</p>
        </div>`,
        `<div class="instructions-content">
            <h1>Rating Scale</h1>
            <p style="margin-bottom: 30px;">You will rate each statement using this <strong>6-point scale</strong>:</p>
            <div class="scale-examples">
                <div style="margin: 12px 0; font-size: 18px;"><strong>0</strong> = This statement doesn't make sense at all</div>
                <div style="margin: 12px 0; font-size: 18px;"><strong>1</strong> = Definitely false</div>
                <div style="margin: 12px 0; font-size: 18px;"><strong>2</strong> = Probably false</div>
                <div style="margin: 12px 0; font-size: 18px;"><strong>3</strong> = Could be true or false</div>
                <div style="margin: 12px 0; font-size: 18px;"><strong>4</strong> = Probably true</div>
                <div style="margin: 12px 0; font-size: 18px;"><strong>5</strong> = Definitely true</div>
            </div>
            <p style="margin-top: 40px; color: #666;">Click 'Next' to continue.</p>
        </div>`,
        `<div class="instructions-content">
            <h1>What to Expect</h1>
            <div style="font-size: 18px; line-height: 2; max-width: 700px; margin: 20px auto; text-align: left;">
                <ul>
                    <li>You will rate <strong>102 statements</strong></li>
                    <li>Each statement appears one at a time</li>
                    <li>Read each statement carefully</li>
                    <li>Select the number that best represents your judgment</li>
                </ul>
            </div>
            <p style="margin-top: 40px;">When you're ready to begin, click 'Next'.</p>
        </div>`
    ],
    show_clickable_nav: true,
    button_label_next: 'Next',
    button_label_previous: 'Back'
};
timeline.push(instructions);

// =============================
// ASSIGN ODD/EVEN LIST AND SHUFFLE
// =============================
const oddStatements = allStatements.filter(s => s.pair % 2 === 1);
const evenStatements = allStatements.filter(s => s.pair % 2 === 0);

// Assign list based on participant_num (odd number = odd pairs, even number = even pairs)
const assignedList = participant_num % 2 === 1 ? oddStatements : evenStatements;
const listType = participant_num % 2 === 1 ? 'odd' : 'even';
const shuffledStatements = jsPsych.randomization.shuffle(assignedList);

jsPsych.data.addProperties({
    list_assignment: listType,
    total_statements: shuffledStatements.length
});

// =============================
// RATING TRIALS
// =============================
shuffledStatements.forEach((statement, index) => {
    const ratingTrial = {
        type: jsPsychHtmlButtonResponse,
        stimulus: function() {
            const progress = ((index + 1) / shuffledStatements.length) * 100;
            return `
                <div style="margin-top: 30px;">
                    <div class="trial-counter">
                        Statement <strong>${index + 1}</strong> of <strong>${shuffledStatements.length}</strong>
                    </div>
                    <div class="statement-text">
                        ${statement.text}
                    </div>
                    <div class="rating-scale">
                        <div class="scale-label">How true or false is this statement?</div>
                    </div>
                </div>
            `;
        },
        choices: ['0', '1', '2', '3', '4', '5'],
        button_html: [
            '<div class="rating-btn-wrapper-zero"><span class="btn-label">Doesn\'t<br>make sense</span><button class="jspsych-btn">%choice%</button></div>',
            '<div class="rating-btn-wrapper"><span class="btn-label">Definitely<br>false</span><button class="jspsych-btn">%choice%</button></div>',
            '<div class="rating-btn-wrapper"><span class="btn-label">Probably<br>false</span><button class="jspsych-btn">%choice%</button></div>',
            '<div class="rating-btn-wrapper"><span class="btn-label">Could be<br>true or false</span><button class="jspsych-btn">%choice%</button></div>',
            '<div class="rating-btn-wrapper"><span class="btn-label">Probably<br>true</span><button class="jspsych-btn">%choice%</button></div>',
            '<div class="rating-btn-wrapper"><span class="btn-label">Definitely<br>true</span><button class="jspsych-btn">%choice%</button></div>'
        ],
        data: {
            task: 'statement_rating',
            statement_id: statement.id,
            pair_number: statement.pair,
            statement_type: statement.type,
            statement_form: statement.form,
            validity: statement.validity,
            plausibility: statement.plausibility,
            statement_text: statement.text,
            trial_number: index + 1
        },
        on_finish: function(data) {
            data.rating = parseInt(data.response);
            data.response_time_seconds = (data.rt / 1000).toFixed(2);
        }
    };

    timeline.push(ratingTrial);

    // Break every 24 trials
    if ((index + 1) % 24 === 0 && (index + 1) < shuffledStatements.length) {
        const breakScreen = {
            type: jsPsychHtmlKeyboardResponse,
            stimulus: `
                <div style="text-align: center; padding: 50px;">
                    <p style="font-size: 20px; margin: 30px 0;">
                        You've completed <strong>${index + 1}</strong> out of <strong>${shuffledStatements.length}</strong> statements.
                    </p>
                    <p style="font-size: 18px; margin-top: 40px;">
                        <strong>Press any key when you're ready to continue.</strong>
                    </p>
                </div>
            `,
            choices: "ALL_KEYS"
        };
        timeline.push(breakScreen);
    }
});

const save_data = {
    type: jsPsychPipe,
    action: "save",
    experiment_id: "tBDDwCetE993",
    filename: filename,
    data_string: () => getFilteredData(),
    on_finish: function(data) {
        if (data.success) {
            console.log('Data saved successfully to DataPipe!');
        } else {
            console.error('Error saving to DataPipe:', data.message);
        }
    }
};
timeline.push(save_data);

// =============================
// THANK YOU SCREEN
// =============================
const thankyou = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function() {
        const data = jsPsych.data.get().filter({task: 'statement_rating'});
        const avgRating = data.select('rating').mean().toFixed(2);
        const avgRT = data.select('response_time_seconds').mean().toFixed(2);

        return `
            <div style="text-align: center; padding: 50px;">
                <h1 style="color: #28a745;">✓ Task Complete!</h1>
                <p style="font-size: 22px; margin: 30px 0;">
                    Thank you for your participation!
                </p>
                <p style="font-size: 18px; margin: 20px 0;">
                    <strong>Your completion code:</strong><br>
                    <span style="font-size: 24px; letter-spacing: 2px;">${completion_code}</span>
                </p>
            </div>
        `;
    },
    choices: "ALL_KEYS"
};
timeline.push(thankyou);

// =============================
// RUN EXPERIMENT
// =============================
jsPsych.run(timeline);