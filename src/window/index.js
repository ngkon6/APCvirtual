let noteData = [];
let selectedNote;

function setFader(number, value) {
    document.querySelector(`#fader${number} .fader-knob`).style.bottom = Math.round(value / 127 * 136) + "px";
}

function enableMiniButton(number) {
    if (number >= 112) document.querySelector(`#minibutton${number}`).style.backgroundColor = "limegreen";
    else if (number >= 100) document.querySelector(`#minibutton${number}`).style.backgroundColor = "red";
}

function setButton(number, to, behavior) {
    if (number >= 112) {
        document.querySelector(`#minibutton${number}`).style.backgroundColor = (document.querySelector(`#minibutton${number}`).style.backgroundColor) ? "" : "limegreen";
        electronAPI.miniButtonToggle(number, document.querySelector(`#minibutton${number}`).style.backgroundColor != "");
    } else if (number >= 100) {
        document.querySelector(`#minibutton${number}`).style.backgroundColor = (document.querySelector(`#minibutton${number}`).style.backgroundColor) ? "" : "red";
        electronAPI.miniButtonToggle(number, document.querySelector(`#minibutton${number}`).style.backgroundColor != "");
    } else {
        const mapping = {
            v0: "#555",
            v1: "#999",
            v3: "#ffffff",
            v5: "#ff0000",
            v7: "#660000",
            v8: "#ffbd6c",
            v9: "#ff5400",
            v13: "#ffff00",
            v20: "#4cff4c",
            v21: "#00ff00",
            v23: "#006600",
            v25: "#00ff19",
            v37: "#00a9ff",
            v40: "#4c88ff",
            v41: "#0055ff",
            v45: "#0000ff",
            v47: "#000066",
            v49: "#5400ff",
            v50: "#190064",
            v53: "#ff00ff",
            v57: "#ff0054",
            v60: "#ff1500"
        };
        const noteID = (number >= 10) ? number : ("0" + number).slice(-2);
        document.querySelector(`#button${noteID}`).style.backgroundColor = mapping[`v${to}`];
        noteData[number] = {color: to, behavior: behavior};
        electronAPI.setColor(number, to, behavior);
        document.querySelector(`#button${noteID}`).style.animationName = (behavior >= 7) ? "buttonfx" : "";
        if (behavior >= 7 && behavior <= 10) {
            const speeds = [1/8 + 0.1, 1/4 + 0.1, 1/2 + 0.1, 1];
            document.querySelector(`#button${noteID}`).style.animationDuration = `${speeds[behavior - 7]}s`;
            document.querySelector(`#button${noteID}`).style.animationTimingFunction = "";
        } else if (behavior > 10) {
            const speeds = [1/12 + 0.05, 1/8 + 0.1, 1/4 + 0.1, 1/2, 1.1];
            document.querySelector(`#button${noteID}`).style.animationDuration = `${speeds[behavior - 11]}s`;
            document.querySelector(`#button${noteID}`).style.animationTimingFunction = "steps(1, end)";
        }

        clearPopups();
    }
}

function validateBehavior(value) {
    document.getElementById("behavior").disabled = (value == 0);
}

function error(head, desc) {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("error-window").style.display = "block";
    document.querySelector("#error-window h2").innerHTML = head;
    document.querySelector("#error-window p").innerHTML = desc;
    document.getElementById("config-window").style.display = "none";
}

function config(number) {
    selectedNote = number;
    document.getElementById("overlay").style.display = "block";
    document.getElementById("config-window").style.display = "block";
    document.querySelector("#config-window h1").innerHTML = `Configure pad ${number}`;
    document.querySelector("#config-window #color").value = noteData[+selectedNote].color;
    document.querySelector("#config-window #behavior").value = noteData[+selectedNote].behavior;
    document.getElementById("error-window").style.display = "none";
    validateBehavior(document.querySelector("#config-window #color").value);
}

function clearPopups() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("error-window").style.display = "none";
    document.getElementById("config-window").style.display = "none";
}

function press(note, state) {
    const noteID = (note >= 10) ? note : ("0" + note).slice(-2);
    document.querySelector(`div[id$="button${noteID}"]`).style.boxShadow = (state) ? "0 0 7px #fff" : "";
}

function lock(state) {
    if (state) error("Locked!", "Please unlock to continue.");
    else clearPopups();
}

window.addEventListener("keydown", function(e) {
    if (e.key == "l" && e.ctrlKey) electronAPI.toggleLock();
    else if (e.key == "Escape" && document.getElementById("config-window").style.display == "block") clearPopups();
});

for (const i of document.querySelectorAll('div[id^="button"]')) {
    i.addEventListener("mousedown", function(e) {
        const number = e.target.id.match(/button(\d+)/)[1];
        if (e.buttons == 1) electronAPI.buttonPress(number);
        else if (e.buttons == 2) config(number);
    });
}
for (const i of document.querySelectorAll('div[id^="minibutton"]')) {
    if (i.id.endsWith("122")) continue;
    i.addEventListener("mousedown", function(e) {
        const number = e.target.id.match(/minibutton(\d+)/)[1];
        if (e.buttons == 1) electronAPI.buttonPress(number);
        else if (e.buttons == 2) setButton(number);
    });
}
