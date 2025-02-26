/**
 * @typedef {"button-press" | "button-release" | "fader-movement"} Events
 * 
 * @callback NumberCallback
 * @param {number} index
 * @param {number} value
 */

const easymidi = require("easymidi");
const { EventEmitter } = require("events");

const inputs = easymidi.getInputs();
const outputs = easymidi.getOutputs();

class APCMiniMk2 extends EventEmitter {
    #dev;
    /** @type {{color: number, mode: number}[]} */
    #buttons;
    /** @type {{color: number, mode: number}[]} */
    #lastButtons;
    /** @type {number[]} */
    #singleLEDButtons;
    /** @type {number[]} */
    #lastSingleLEDButtons;

    static color = {
        BLACK: 0,
        WHITE: 3,
        RED: 5,
        ORANGE: 9,
        RED_ORANGE: 60,
        YELLOW: 13,
        GREEN: 21,
        MINT_GREEN: 20,
        SEA_GREEN: 25,
        CYAN: 37,
        LAVENDER: 41,
        BLUE: 45,
        SKY_BLUE: 40,
        VIOLET: 49,
        MAGENTA: 53,
        PINK: 57
    };
    static mode = {
        BRIGHTNESS_10: 0,
        BRIGHTNESS_25: 1,
        BRIGHTNESS_50: 2,
        BRIGHTNESS_65: 3,
        BRIGHTNESS_75: 4,
        BRIGHTNESS_90: 5,
        BRIGHTNESS_100: 6,
        BREATHING_1_16: 7,
        BREATHING_1_8: 8,
        BREATHING_1_4: 9,
        BREATHING_1_2: 10,
        FLASHING_1_24: 11,
        FLASHING_1_16: 12,
        FLASHING_1_8: 13,
        FLASHING_1_4: 14,
        FLASHING_1_2: 15,
        SINGLE_OFF: 0,
        SINGLE_ON: 1,
        SINGLE_BLINK: 2
    };

    constructor() {
        super();

        let input, output;
        for (let i=0; i<inputs.length;) {
            if (inputs[i].includes("APC mini mk2 Contr")) {
                input = inputs[i];
                inputs.splice(i, 1);
            } else i++;
        }
        for (let i=0; i<outputs.length;) {
            if (outputs[i].includes("APC mini mk2 Contr")) {
                output = outputs[i];
                outputs.splice(i, 1);
            } else i++;
        }

        try {
            this.#dev = {
                in: new easymidi.Input(input),
                out: new easymidi.Output(output)
            };
        } catch {
            throw new Error("APC Mini MK2 device not found.");
        }

        this.#dev.in.on("noteon", (e) => {
            this.emit("button-press", this.#getNote(e.note));
        });
        this.#dev.in.on("noteoff", (e) => {
            this.emit("button-release", this.#getNote(e.note));
        });
        this.#dev.in.on("cc", (e) => {
            this.emit("fader-movement", e.controller - 48, e.value);
        });

        this.#buttons = JSON.parse(JSON.stringify(new Array(64).fill({color: 0, mode: -1})));
        this.#lastButtons = JSON.parse(JSON.stringify(new Array(64).fill({color: 0, mode: -1})));
        this.#singleLEDButtons = JSON.parse(JSON.stringify(new Array(20).fill(-1)));
        this.#lastSingleLEDButtons = JSON.parse(JSON.stringify(new Array(20).fill(-1)));
    }
    /**
     * @param {Events} event
     * @param {NumberCallback} callback
     */
    addListener(event, callback) {
        super.addListener(event, callback);
    }
    /**
     * @param {Events} event
     * @param {NumberCallback} callback
     */
    on(event, callback) {
        super.on(event, callback);
    }
    /**
     * @param {Events} event
     * @param {NumberCallback} callback
     */
    once(event, callback) {
        super.once(event, callback);
    }
    /**
     * @param {Events} event
     * @param {NumberCallback} callback
     */
    off(event, callback) {
        super.off(event, callback);
    }

    /**
     * @param {number} x The original note number.
     * @returns {number} The row-inverted note number.
     */
    #getNote(x) {
        return (x > 63) ? x : (7 - Math.floor(x / 8)) * 8 + (x % 8);
    }

    /**
     * Set a button mode/color.
     * @param {number} button The button number, from 0-63.
     * @param {number} color The button LED color, from `APCMiniMK2.color`.
     * @param {number} mode The button LED mode, from `APCMiniMK2.mode`.
     */
    setButton(button, color = APCMiniMk2.color.WHITE, mode = APCMiniMk2.mode.BRIGHTNESS_100) {
        if (button >= 0 && button <= 63 && color >= 0 && color <= 127 && mode >= 0 && mode <= 127) {
            this.#buttons[button].color = color;
            this.#buttons[button].mode = mode;
        }
    }

    /**
     * Set a red LED button mode.
     * @param {number} button The red LED button number, from 0-7.
     * @param {number} state The button state, from `APCMiniMk2.mode.SINGLE_*`.
     */
    setRedButton(button, state) {
        if (button >= 0 && button <= 7 && state >= 0 && state <= 2) this.#singleLEDButtons[button] = state;
    }

    /**
     * Set a green LED button mode.
     * @param {number} button The green LED button number, from 0-7.
     * @param {number} state The button state, from `APCMiniMk2.mode.SINGLE_*`.
     */
    setGreenButton(button, state) {
        if (button >= 0 && button <= 7 && state >= 0 && state <= 2) this.#singleLEDButtons[button + 12] = state;
    }

    /**
     * Get a button mode and color
     * @param {number} button The button number, from 0-63.
     * @returns {{color: number, mode: number}}
     */
    getButton(button) {
        return {
            color: Math.max(0, this.#buttons[button].color),
            mode: Math.max(0, this.#buttons[button].mode)
        }
    }

    /**
     * Get a red LED button mode.
     * @param {number} button The red LED button, from 0-7.
     * @returns {number}
     */
    getRedButton(button) {
       return Math.max(0, this.#singleLEDButtons[button]);
    }

    /**
     * Get a green LED button mode.
     * @param {number} button The green LED button, from 0-7.
     * @returns {number}
     */
    getGreenButton(button) {
        return Math.max(this.#singleLEDButtons[button + 12]);
    }

    /**
     * Show the changes made by `setButton`, `setRedButton` and `setGreenButton` on the device.
     */
    show() {
        const rows = this.#buttons.reduce((result, item, index) => {
            const chunkIndex = Math.floor(index / 8);
            if (!result[chunkIndex]) result[chunkIndex] = [];
            result[chunkIndex].push(item);

            return result;
        }, []);
        
        rows.reverse();
        for (let i=0; i<this.#buttons.length; i++) {
            const before = this.#lastButtons[i];
            const after = this.#buttons[i];
            if (before.color !== after.color || before.mode !== after.mode) {
                console.warn("Updating RGB");
                this.#dev.out.send("noteon", {
                    channel: this.#buttons[i].mode,
                    note: this.#getNote(i),
                    velocity: this.#buttons[i].color
                });
            }
        }
        for (let i=0; i<this.#singleLEDButtons.length; i++) {
            if (this.#singleLEDButtons[i] !== this.#lastSingleLEDButtons[i]) {
                console.warn("Updating single");
                this.#dev.out.send("noteon", {
                    channel: 0,
                    note: i + 100,
                    velocity: this.#singleLEDButtons[i]
                });
            }
        }
        
        this.#lastButtons = JSON.parse(JSON.stringify(this.#buttons));
        this.#lastSingleLEDButtons = JSON.parse(JSON.stringify(this.#singleLEDButtons));
    }

    /**
     * Turn off all LED lights. No need to call `show` on this one as well.
     */
    clear() {
        for (let i=0; i<120; i++) {
            if (i < 64 || (i >= 100 && i <= 107) || (i >= 112 && i <= 119))
                this.#dev.out.send("noteon", {channel: 0, note: i, velocity: 0});
        }
    }
}

module.exports = APCMiniMk2;
