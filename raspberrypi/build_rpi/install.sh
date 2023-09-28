#/bin/bash
# update and upgrade to latest packages
sudo apt update
sudo apt upgrade
# install xserver, xinit, openbox, chromium-browser, pcmanfm, docker
sudo apt install --no-install-recommends xserver-xorg x11-xserver-utils xinit openbox
sudo apt install --no-install-recommends chromium-browser
sudo apt install pcmanfm
# use the convenience script to install docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh ./get-docker.sh
# post install docker
sudo groupadd docker
sudo usermod -aG docker $USER
newgrp docker
