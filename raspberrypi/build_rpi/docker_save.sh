#! /bin/bash
# run these commands on the machine where the arm64 docker images are built

docker save aliro_machine | gzip > aliro_machine.tar.gz
docker save aliro_lab | gzip > aliro_lab.tar.gz
docker save aliro_dbmongo | gzip > aliro_dbmongo.tar.gz