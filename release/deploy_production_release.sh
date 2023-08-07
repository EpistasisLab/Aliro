#!/bin/bash

PROD_BASE_DIR="target/production"

# get the current version
source .env 
echo "tag: $TAG"

# get production folder
PROD_BUILD_DIR="${PROD_BASE_DIR}/Aliro-${TAG}"
PROD_ZIP_FILENAME="${PROD_BASE_DIR}/Aliro-${TAG}.zip"

# get current branch
branch_name=$(git symbolic-ref HEAD)
echo "branch_name: '${branch_name}'"

# get branch status
git_status=$(git status -uno -s)
echo "git_status: '${git_status}'"


############################
### deploy preconditions ###
############################

# make sure we are on the production branch
if [ ! $branch_name = "refs/heads/production" ]; then
	echo "ERROR: Not on production branch"
	exit 1
fi

# make sure we are up to date with master
git remote update
if [ ! -z "$git_status" ]; then
	echo "ERROR: Git branch not up to date with master, git status:"
	echo $git_status
	exit 1
fi

# make sure the docker images and production zip exist
docker image inspect moorelab/aliro_lab:${TAG}
docker image inspect moorelab/aliro_machine:${TAG}
docker image inspect moorelab/aliro_dbmongo:${TAG}

echo "Found docker images"

if [ ! -f ${PROD_ZIP_FILENAME} ]; then
	echo "ERROR: File '${PROD_ZIP_FILENAME}' not found.  Exiting."
	exit 1
else
	echo "Found release file '${PROD_ZIP_FILENAME}'"
fi


#########################
### docker/git deploy ###
#########################

#### push to dockerhub
echo "Images should already be pushed to DockerHub"
# echo "Pushing to images to DockerHub"
# docker push moorelab/aliro_lab:${TAG}
# docker push moorelab/aliro_machine:${TAG}
# docker push moorelab/aliro_dbmongo:${TAG}

# git tag
git tag -fa "v${TAG}" -m "v${TAG}"
git push --tags

# create github relase and attach zip
# TODO
#echo "Creating Github release and pushing production zip"
