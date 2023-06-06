const easymidi = require("easymidi");
const path = require("path");
const { EOL } = require("os");
const fs = require("fs");

const inputs = easymidi.getInputs();
const outputs = easymidi.getOutputs();

console.log("Available inputs:");
for (let i=0; i<inputs.length; i++) console.log(`${i} >> ${inputs[i]}`);
console.log(EOL + "Available outputs:");
for (let i=0; i<outputs.length; i++) console.log(`${i} >> ${outputs[i]}`);
console.log(EOL);

const input = new easymidi.Input(inputs[1]);
const output = new easymidi.Output(outputs[0]);
const controller = new easymidi.Output(outputs[1]);

const colors = {
    black: 0,
    white: 3,
    red: 5,
    warmwhite: 8,
    orange: 9,
    yellow: 13,
    mintgreen: 20,
    green: 21,
    seagreen: 25,
    cyan: 37,
    skyblue: 40,
    lavender: 41,
    blue: 45,
    violet: 49,
    uv: 50,
    magenta: 53,
    pink: 57
};

let note = 0;

if (fs.existsSync(path.join(__dirname, "colormap.txt"))) {
    fs.readFile(path.join(__dirname, "colormap.txt"), function(err, data) {
        if (err) throw err;
        const colorMap = new TextDecoder().decode(data).split(EOL);
        colorMap.reverse();
        if (colorMap.length != 8) {
            console.error("The colormap should contain 8 lines!");
            process.exit(1);
        } else {
            for (const line of colorMap) {
                const row = line.split("|");
                if (row.length != 8) {
                    console.error("The colormap lines should contain 8 fields!");
                    process.exit(2);
                } else {
                    for (const cell of row) {
                        if (cell.includes("@")) {
                            const pad = cell.split("@");
                            if (isNaN(pad[1])) console.warn("The color state must be numeric!");
                            else if (!pad[0].trim() in colors) console.warn("The given color was not found in the color scheme.");
                            else controller.send("noteon", {note: note, velocity: colors[pad[0].trim()], channel: parseInt(pad[1])});
                        } else if (!cell.trim() in colors) console.warn("The given color was not found in the color scheme.");
                        else controller.send("noteon", {note: note, velocity: colors[cell.trim()], channel: 6});
                        
                        note++;
                    }
                }
            }
        }    
    });
} else console.warn("No colormap.txt was found, so the pads will not be illuminated.");

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
