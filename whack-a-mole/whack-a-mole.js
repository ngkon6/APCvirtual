const APCMiniMk2 = require("./class");

const apc = new APCMiniMk2();

let score = 0;

apc.on("button-press", b => {
    if (b > 63) return;

    if (apc.getButton(b).color === APCMiniMk2.color.GREEN) {
        score++;
        apc.setGreenButton(8 - score, APCMiniMk2.mode.SINGLE_ON);
        apc.setButton(b, APCMiniMk2.color.BLACK);
        apc.show();
    
        if (score >= 8) {
            const checkMark = [6,7,13,14,15,16,20,21,22,23,24,25,27,28,29,30,32,33,34,35,36,37,40,41,42,43,44,49,50,51,58];
            for (const i of checkMark) apc.setButton(i, APCMiniMk2.color.SEA_GREEN, APCMiniMk2.mode.BREATHING_1_2);
            apc.show();
            process.exit(0);
        }
    } else if (apc.getButton(b).color === APCMiniMk2.color.RED) {
        apc.setGreenButton(8 - score, APCMiniMk2.mode.SINGLE_OFF);
        apc.show();
        score = Math.max(0, score - 1);
    }
});

const loop = () => {
    if (Math.random() < 0.022) {
        let button;
        while (1) {
            button = Math.floor(Math.random() * 64);
            if (apc.getButton(button).color === 0) break;
        }
        const whackMeOrNot = (Math.random() > 0.5) ? APCMiniMk2.color.GREEN : APCMiniMk2.color.RED;
        apc.setButton(button, whackMeOrNot);
        setTimeout(() => apc.setButton(button, APCMiniMk2.color.BLACK), 325);
    }

    apc.show();
};

apc.clear();
setInterval(loop, 17);
