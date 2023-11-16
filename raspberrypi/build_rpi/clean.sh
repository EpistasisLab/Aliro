#/bin/bash
# disable and remove bluetooth
# not needed in kiosk mode
sudo systemctl disable hciuart.service
sudo systemctl disable bluealsa.service
sudo systemctl disable bluetooth.service
sudo apt purge bluez -y
# remove unnecessary packages and clean up apt
sudo apt autoremove -y
sudo apt autoclean -y
sudo apt clean -y
sudo journalctl --vacuum-time=7d
docker builder prune --all
sudo rm -rf /var/log/*
sudo rm -rf /tmp/*
# clear bash history
history -c

