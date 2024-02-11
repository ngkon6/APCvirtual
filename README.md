# APCvirtual

Simple tool visualizing the AKAI APC Mini MK2 and gives the ability to enable and disable the LEDs to your desire.  
Next to that, it also converts Control Changes to MIDI notes and outputs them to a Midi Through device on Linux.  
Might be useful for some programs!

## Building
Just run `npm run build` to build the package. Note that having `libasound2-dev` installed is required!

## Create desktop entry
To create a desktop entry, **ensure that you are in the repository folder first!**  
Then, run the `create-desktop-entry.sh` file to create a desktop entry into `~/.local/share/applications`.

> **Note**: This program does not work when no APC Mini is connected to the computer.

## Will it work?

- **Windows**: No
- **Linux Mint 21.1**: Certainly! It has been developed and tested on this distribution.
- **Other Linux distributions and Mint versions**: *not tested*
- **macOS**: *also not tested*
