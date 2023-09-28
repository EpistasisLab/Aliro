#!/bin/bash

PROD_BASE_DIR="target/production"


# get the current version
source .env 
echo "tag: $TAG"

# create and zip production folder
PROD_BUILD_DIR="${PROD_BASE_DIR}/Aliro-${TAG}"
PROD_ZIP_FILENAME="${PROD_BASE_DIR}/Aliro-${TAG}.zip"

echo "Creating production directory: ${PROD_BUILD_DIR}"

rm $PROD_BUILD_DIR -fr
rm $PROD_ZIP_FILENAME

mkdir -p "${PROD_BUILD_DIR}/data/datasets/user"
mkdir -p "${PROD_BUILD_DIR}/data/recommenders"
mkdir -p "${PROD_BUILD_DIR}/config"

cp release/userReadme.txt "${PROD_BUILD_DIR}/readme.txt"

cp data/datasets/user/myDataset_metadata.json.example "${PROD_BUILD_DIR}/data/datasets/user"
cp data/datasets/user/readme.md "${PROD_BUILD_DIR}/data/datasets/user"

cp data/recommenders/pennaiweb/SVDRecommender_*.pkl.gz "${PROD_BUILD_DIR}/data/recommenders"

cp config/common.env "${PROD_BUILD_DIR}/config"
cp config/machine_config.json "${PROD_BUILD_DIR}/config"
cp config/ai.env-template "${PROD_BUILD_DIR}/config"
cp "${PROD_BUILD_DIR}/config/ai.env-template" "${PROD_BUILD_DIR}/config/ai.env"

cp .env "${PROD_BUILD_DIR}/.env"
cp release/docker-compose-hub-image.yml "${PROD_BUILD_DIR}/docker-compose.yml"

zip -r $PROD_ZIP_FILENAME $PROD_BUILD_DIR

# build multi-architecture images with buildx
echo "Installing multi-platform installation support"
docker run --privileged -rm tonistiigi/binfmt --install all

# create an aliro release builder with buildx
docker buildx create --name aliroreleasebuilder --driver docker-container --bootstrap --use

##### NOTES #######
# Alternatively, I should be able to use the --builder flag, for example docker buildx bake --builder aliroreleasebuilder
# This may be a better option if it works, since this won't change the builder in the current shell.
# The default builder will remain selected, and the aliroreleasebuilder will be used only by this command.
# For completeness, the documentation mentions the BUILDX_BUILDER env variable also:
# https://docs.docker.com/build/builders/

# build production images
echo "Building docker production images"
#docker volume prune
# docker-compose -f docker-compose-production.yml build -m 10g
docker buildx bake -f docker-compose-production.yml --push

# tagging production images is not necessary with docker buildx bake
# echo "Tagging production images"
# docker tag aliro_lab:${TAG} moorelab/aliro_lab:${TAG}
# docker tag aliro_machine:${TAG} moorelab/aliro_machine:${TAG}
# docker tag aliro_dbmongo:${TAG} moorelab/aliro_dbmongo:${TAG}
