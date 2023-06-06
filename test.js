const easymidi = require("easymidi");

const inputs = easymidi.getInputs();
const outputs = easymidi.getOutputs();

console.log("Available inputs:");
for (let i=0; i<inputs.length; i++) console.log(`${i} >> ${inputs[i]}`);
console.log("\nAvailable outputs:");
for (let i=0; i<outputs.length; i++) console.log(`${i} >> ${outputs[i]}`);

const input = new easymidi.Input(inputs[1]);

input.on("noteon", function(res) {
    console.log(`Note on: note ${res.note} set to ${res.velocity} in channel ${res.channel}`);
});

input.on("noteoff", function(res) {
    console.log(`Note off: note ${res.note} set to ${res.velocity} in channel ${res.channel}`);
});

input.on("cc", function(res) {
    console.log(`Control change: controller ${res.controller} set to ${res.value} in channel ${res.channel}`);
});
