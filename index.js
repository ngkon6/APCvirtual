const { app, BrowserWindow, ipcMain } = require("electron");
const easymidi = require("easymidi");
const path = require("path");
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
let notes;
let locked = false;
let launched = false;

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

if (!fs.existsSync(path.join("src", "notes.json"))) {
    fs.copyFile("notes-template.json", path.join("src", "notes.json"), function(err) {
        if (err) throw err;
    });
}

app.on("ready", function() {
    window = new BrowserWindow({
        width: 720,
        height: 627,
        resizable: false,
        webPreferences: {
            devTools: false,
            preload: path.join(__dirname, "src", "preload.js")
        }
    });
    window.menuBarVisible = false;
    window.loadFile("src/window/index.html");
    window.setTitle("APCvirtual");
    window.setIcon("src/icon.png");
    window.on("ready-to-show", function() {
        window.show();
        launched = true;
        if (noControllerFound) window.webContents.executeJavaScript('error("No APC mini is connected!", "Please connect one and restart to proceed.")');
    });

    ipcMain.on("press", function(_event, number) {
        output.send("noteon", {note: number, velocity: 127, channel: 0});
    });
    ipcMain.on("release", function(_event, number) {
        output.send("noteon", {note: number, velocity: 0, channel: 0});
    });
    ipcMain.on("minibutton-led", function(_event, data) {
        controller.send("noteon", {note: data.n, velocity: data.v, channel: 0});
        if (notes) {
            notes.minibuttons[`n${data.n}`] = Boolean(data.v);
            fs.writeFile(path.join(__dirname, "src", "notes.json"), JSON.stringify(notes), function(err) {
                if (err) throw err;
            });
        }
    });
    ipcMain.on("set-color", function(_event, data) {
        controller.send("noteon", {note: +data.n, velocity: +data.v, channel: +data.c});
        if (notes) {
            notes.buttons[+data.n].v = +data.v;
            notes.buttons[+data.n].c = +data.c;
            fs.writeFile(path.join(__dirname, "src", "notes.json"), JSON.stringify(notes), function(err) {
                if (err) throw err;
            });
        }
    });
    ipcMain.on("toggle-lock", function() {
        locked = !locked;
        window.webContents.executeJavaScript(`lock(${locked})`);
    });

    if (fs.existsSync(path.join(__dirname, "src", "notes.json"))) {
        fs.readFile(path.join(__dirname, "src", "notes.json"), function(err, data) {
            if (err) throw err;
            notes = JSON.parse(new TextDecoder().decode(data));
            for (const button in notes.buttons) {
                window.webContents.executeJavaScript(`setButton(${button}, ${notes.buttons[button].v}, ${notes.buttons[button].c})`);
            }
            for (const minibutton in notes.minibuttons) {
                if (notes.minibuttons[minibutton]) {
                    window.webContents.executeJavaScript(`enableMiniButton(${minibutton.slice(1)})`);
                    controller.send("noteon", {note: +minibutton.slice(1), velocity: 127, channel: 0});
                }
            }
        });
    }
});
app.on("window-all-closed", function() {
    if (process.platform != "darwin") app.quit();
});
