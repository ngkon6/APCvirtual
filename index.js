const { app, BrowserWindow, ipcMain } = require("electron");
const easymidi = require("easymidi");
const path = require("path");
const { EOL } = require("os");
const fs = require("fs");
let window;
let input = {};
let output = {};
let controller = {send: () => {}};

const inputs = easymidi.getInputs();
const outputs = easymidi.getOutputs();
let foundInput = -1;
let foundOutput = -1;
let foundController = -1;
let noControllerFound = false;

for (let i in inputs) {
    if (inputs[i].includes("APC mini mk2 Contr")) foundInput = +i;
}
for (let i in outputs) {
    if (outputs[i].includes("Midi Through")) foundOutput = +i;
    if (outputs[i].includes("APC mini mk2 Contr")) foundController = +i;
}

try {
    input = new easymidi.Input(inputs[foundInput]);
    output = new easymidi.Output(outputs[foundOutput]);
    controller = new easymidi.Output(outputs[foundController]);

    input.on("noteon", function(res) {
        if (locked) console.warn("Script is locked!");
        else {
            output.send("noteon", {note: res.note, velocity: res.velocity, channel: 0});
            window.webContents.executeJavaScript(`press(${res.note}, true)`);
        }
    });
    
    input.on("noteoff", function(res) {
        if (locked) console.warn("Script is locked!");
        else {
            output.send("noteoff", {note: res.note, velocity: res.velocity, channel: 0});
            window.webContents.executeJavaScript(`press(${res.note}, false)`);
        }
    });
    
    input.on("cc", function(res) {
        const note = res.controller + 20;
        if (launched && !locked) window.webContents.executeJavaScript(`setFader(${note}, ${res.value})`);
        
        if (locked) console.warn("Script is locked!");  
        else output.send("noteon", {note: note, velocity: res.value, channel: 0});
    });
} catch (err) {
    noControllerFound = true;
}

app.on("ready", function() {
    window = new BrowserWindow({width: 240 * 3, height: 209 * 3, resizable: false, webPreferences: {preload: path.join(__dirname, "preload.js")}});
    window.menuBarVisible = false;
    window.loadFile("window/index.html");
    window.setTitle("MidiConverter");
    window.setIcon("icon.png");
    window.on("ready-to-show", function() {
        window.show();
        launched = true;
        if (noControllerFound) window.webContents.executeJavaScript('error("No APC mini is connected!", "Please connect one and restart to proceed.")');
    });

    ipcMain.on("press", function(_event, number) {
        output.send("noteon", {note: number, velocity: 127, channel: 0});
    });
    ipcMain.on("minibutton-led", function(_event, data) {
        const response = data.split("@");
        controller.send("noteon", {note: response[0], velocity: response[1], channel: 0});
    });
    ipcMain.on("set-color", function(_event, data) {
        const response = data.split("@");
        controller.send("noteon", {note: +response[0], velocity: +response[1], channel: +response[2]});
    });
    ipcMain.on("toggle-lock", function() {
        locked = !locked;
        window.webContents.executeJavaScript(`lock(${locked})`);
    });
});

const colors = {
    black: 0,
    dimwhite: 1,
    white: 3,
    red: 5,
    dimred: 7,
    warmwhite: 8,
    orange: 9,
    yellow: 13,
    mintgreen: 20,
    green: 21,
    dimgreen: 23,
    seagreen: 25,
    cyan: 37,
    skyblue: 40,
    lavender: 41,
    blue: 45,
    violet: 49,
    uv: 50,
    magenta: 53,
    pink: 57,
    orangered: 60
};

let note = 0;
let locked = false;
let launched = false;

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
