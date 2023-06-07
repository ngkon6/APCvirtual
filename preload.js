const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
    buttonPress: function(number) {
        ipcRenderer.send("press", number);
    },
    miniButtonToggle: function(number, state) {
        ipcRenderer.send("minibutton-led", `${number}@${Number(state)}`);
    },
    setColor: function(number, color, behavior) {
        ipcRenderer.send("set-color", `${number}@${color}@${behavior}`);
    },
    toggleLock: function() {
        ipcRenderer.send("toggle-lock");
    }
});
