
const subject_id = jsPsych.randomization.randomID(10);
const filename = `${subject_id}.csv`;

const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: "tBDDwCetE993",
  filename: filename,
  data_string: ()=>jsPsych.data.get().csv()
};