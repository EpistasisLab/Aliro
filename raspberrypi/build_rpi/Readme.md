# Raspberry Pi OS Setup Instructions
1. Use the raspberry pi imager to write Raspberry Pi OS Lite (64-bit) onto an sd card
2. Boot the Raspberry Pi OS   
**NOTE:** The following steps require that the Raspberry Pi have an active internet connection.
Wifi can be configured by running `sudo raspi-config` and setting up the **Wireless LAN** in **System Options**.
3. Run install.sh
  a. verify that docker is installed. Run `docker --version`
4. Copy the ./Aliro/raspberrypi/intropage directory into the root directory (/intropage)
5. Open the chromium-browser (`right-click the desktop and open the web browser`)
6. Configure the browser to open a custom page when it starts `file:///home/aliroed/intropage/index.html`
4. Add the line in the `autostart` file in the existing `/etc/xdg/openbox/autostart` file.  
**Note:** if the `autostart` file doesn't exist, you can copy the one here as-is.
5. Download the `Aliro-*.zip` file from the GitHub release page into the home directory. (`~/Alizo-*.zip`)
6. unzip the `.zip` file
7. Move the contents of the `~/target/production/Aliro-*/` directory into `/aliro/` (`mkdir /aliro` first)
8. Change directory into the aliro directory `cd /aliro` and run `docker compose pull`  
9. run the `docker_compress.sh` script to compress the pulled docker images.  
Check that the images were saved in the `/images` directory, you should see 3 .tar.gz files:  
`aliro_dbmongo.tar.gz`  
`aliro_lab.tar.gz`  
`aliro_machine.tar.gz`  
10. Remove the pulled docker images by running the `docker_prune.sh` script. This will greatly reduce
the space used by the images.
11. copy the aliroed-compose.service file in /etc/systemd/system/ (`sudo cp aliroed-compose.service /etc/systemd/system/`
12. enable the aliroed-compose service with `sudo systemctl enable aliroed-compose.service`

# not sure if the next steps will be necessary
12. Remove any unused kernels:
use `uname -r` to check the current kernel in use  
use `dpkg -l | grep linux-image` to see a list of installed kernels
remove the ones we don't need with `sudo apt purge linux-image-<kernel-name>`
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
