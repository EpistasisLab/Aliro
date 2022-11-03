#! /bin/bash
# run these commands on the machine where the arm64 docker images are built

docker load < aliro_machine.tar.gz
docker load < aliro_lab.tar.gz
docker load < aliro_dbmongo.tar.gz