#/bin/bash
mkdir /images
docker save moorelab/aliro_dbmongo | gzip > /images/aliro_dbmongo.tar.gz
docker save moorelab/aliro_lab | gzip > /images/aliro_lab.tar.gz
docker save moorelab/aliro_machine | gzip > /images/aliro_machine.tar.gz
