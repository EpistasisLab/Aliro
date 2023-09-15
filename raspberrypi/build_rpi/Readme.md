# Raspberry Pi OS Setup Instructions
1. Use the raspberry pi imager to write Raspberry Pi OS Lite (64-bit) onto an sd card
2. Boot the Raspberry Pi OS and setup the locale, keyboard layout and initial username and password. Enable **Auto-Login** in **System Options**
**NOTE:** The following steps require that the Raspberry Pi have an active internet connection. Wifi can be configured by running `sudo raspi-config` and setting up the **Wireless LAN** in **System Options**.
3. run install.sh
  a. verify that docker is installed. Run `docker --version`
4. save the autostart file in /etc/xdg/openbox/
5. copy the .bash_profile file into the initial user's home directory (~/.bash_profile)
6. copy the ./Aliro/raspberrypi/intropage directory into the user's home directory (~/intropage)
7. copy the extracted contents of the Aliro-*.zip file from the GitHub release page into the user's home page. (~/target)
8. change directory into ~/target/production/Aliro-*/ and run `docker compose pull`
  **NOTE:** The docker images will only be **pulled**. The containers will not be built inside the Pi (to keep the final custom OS as light as possible)
9. run clean.sh

# Building the aliro-image executable
## Windows

## Linux
