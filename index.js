const easymidi = require("easymidi");

const inputs = easymidi.getInputs();
const outputs = easymidi.getOutputs();

console.log("Available inputs:");
for (let i=0; i<inputs.length; i++) console.log(`${i} >> ${inputs[i]}`);
console.log("\nAvailable outputs:");
for (let i=0; i<outputs.length; i++) console.log(`${i} >> ${outputs[i]}`);

const input = new easymidi.Input(inputs[1]);
const output = new easymidi.Output(outputs[0]);

input.on("noteon", function(res) {
    if (process.argv.includes("-v")) console.log(`Note on: note ${res.note} set to ${res.velocity} in channel ${res.channel}`);
    output.send("noteon", {note: res.note, velocity: res.velocity, channel: 0});
});

input.on("noteoff", function(res) {
    if (process.argv.includes("-v")) console.log(`Note off: note ${res.note} set to ${res.velocity} in channel ${res.channel}`);
    output.send("noteoff", {note: res.note, velocity: res.velocity, channel: 0});
});

input.on("cc", function(res) {
    if (process.argv.includes("-v")) console.log(`Control change: controller ${res.controller} set to ${res.value} in channel ${res.channel}`);
    output.send("noteon", {note: res.controller + 20, velocity: res.value, channel: 0});
});
