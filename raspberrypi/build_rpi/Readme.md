# Raspberry Pi OS Setup Instructions
1. Use the raspberry pi imager to write Raspberry Pi OS Lite (64-bit) onto an sd card
2. Boot the Raspberry Pi OS and setup the locale, keyboard layout and initial username and password. Enable **Auto-Login** in **System Options**
**NOTE:** The following steps require that the Raspberry Pi have an active internet connection. Wifi can be configured by running `sudo raspi-config` and setting up the **Wireless LAN** in **System Options**.
3. run install.sh
  a. verify that docker is installed. Run `docker --version`
4. save the autostart file in /etc/xdg/openbox/
5. copy the .bash_profile file into the initial user's home directory (~/.bash_profile)
6. copy the ./Aliro/raspberrypi/intropage directory into the root directory (/intropage)
7. copy the extracted contents of the Aliro-*.zip file from the GitHub release page into the root directory. (/target)
8. change directory into /target/production/Aliro-*/ and run `docker compose pull`
  **NOTE:** The docker images will only be **pulled**. The containers will not be built inside the Pi (to keep the final custom OS as light as possible)
9. copy the aliroed-compose.service file in /etc/systemd/system/ (`sudo cp aliroed-compose.service /etc/systemd/system/`
10. enable the aliroed-compose service with `sudo systemctl enable aliroed-compose.service`
12. Remove any unused kernels:
use `uname -r` to check the current kernel in use  
use `dpkg -l | grep linux-image` to see a list of installed kernels
remove the ones we don't need with `sudo apt purge linux-image-<kernel-name>`
13. Zero out free space for better compression:
    This one was useless!
Inside the Raspberry Pi, run `sudo dd if=/dev/zero of=/EMPTY bs=1M` and `sudo rm -f /EMPTY`
14. run clean.sh

# Building the aliro-image executable
## Windows
Perform these steps after performing the steps in Linux to extract the .img file, shrinking with PiShrink and compressing with xz.
These steps work on a Windows 11 machine:
1. Ensure you have a Code Signing Certificate installed.
2. Embed the aliro.img.xz file in the same level as the **src** directory. 
3. Open the Epistasis/aliro-imager project in Qt Creator (follow the instructions on the aliro-imager repository)
4. Configure the version number as needed. The current scheme is to use the version of the latest Aliro Release (e.g. 0.21)
5. Proceed to `Build All Projects` in Qt Creator
6. Use `nsis-binary-7336-1` to build the installer, using the **aliro-imager.nsi** script output by the Qt Creator build.
## Linux
1. Extract the image into a **.img** file with a tool like **dd**: `sudo dd if=/dev/sdX of=aliroed.img bs=4M`
2. Use PiShrink to shrink the image. The image should also be compressed with **xz**. There are 2 options for this: `sudo ./pishrink.sh aliroed.img`
    a. use PiShrink with the -Z option, or 
    b. use the `xz` utility independently: `xz -9 aliroed.img` (**Note: This option has worked best so far**)
