#!/bin/sh

echo "Creating desktop entry for $PWD..."
echo "[Desktop Entry]
Name=APCvirtual
Comment=Virtualizer for APC Mini MK2
Exec=/usr/bin/npm start --prefix $PWD
Icon=$PWD/src/icon.png
Type=Application
Terminal=false
Categories=SoundVideo;
Keywords=APC;AKAI;MIDI;controller;virtualizer;
StartupWMClass=processing-app-Base
Hidden=false
NoDisplay=false" > ~/.local/share/applications/apcvirtual.desktop
echo "Done!"
