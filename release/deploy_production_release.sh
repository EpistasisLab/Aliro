#!/bin/bash

PROD_BASE_DIR="target/production"

# get the current version
source .env 
echo "tag: $TAG"

# create and zip production folder
PROD_BUILD_DIR="${PROD_BASE_DIR}/pennai-${TAG}"
PROD_ZIP_FILENAME="${PROD_BASE_DIR}/pennai-${TAG}.zip"


# make sure the docker images and production zip exist
docker image inspect moorelab/pennai_lab:${TAG}
docker image inspect moorelab/pennai_machine:${TAG}
docker image inspect moorelab/pennai_dbmongo:${TAG}

echo "Found docker images"

if [ ! -f ${PROD_ZIP_FILENAME} ]; then
	echo "ERROR: File '${PROD_ZIP_FILENAME}' not found.  Exiting."
	exit 1
else
	echo "Found release file '${PROD_ZIP_FILENAME}'"
fi


# create git relase and attach zip
# TODO
#echo "Creating Github release and pushing production zip"


# push to dockerhub
echo "Pushing to images to DockerHub"
docker push moorelab/pennai_lab:${TAG}
docker push moorelab/pennai_machine:${TAG}
docker push moorelab/pennai_dbmongo:${TAG}