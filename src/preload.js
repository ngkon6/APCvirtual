const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    buttonPress: function(number) {
        ipcRenderer.send("press", number);
    },
    buttonRelease: function(number) {
        ipcRenderer.send("release", number);
    },
    miniButtonToggle: function(number, state) {
        ipcRenderer.send("minibutton-led", {n: number, v: Number(state)});
    },
    setColor: function(number, color, behavior) {
        ipcRenderer.send("set-color", {n: number, v: color, c: behavior});
    },
    toggleLock: function() {
        ipcRenderer.send("toggle-lock");
    }
});
