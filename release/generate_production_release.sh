#!/bin/bash

PROD_BASE_DIR="target/production"


# get the current version
source .env 
echo "tag: $TAG"

# create and zip production folder
PROD_BUILD_DIR="${PROD_BASE_DIR}/pennai-${TAG}"
PROD_ZIP_FILENAME="${PROD_BASE_DIR}/pennai-${TAG}.zip"

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

# build production images
echo "Building docker production images"
#docker volume prune
docker-compose -f docker-compose-production.yml build -m 10g

echo "Tagging production images"
docker tag pennai_lab:${TAG} moorelab/pennai_lab:${TAG}
docker tag pennai_machine:${TAG} moorelab/pennai_machine:${TAG}
docker tag pennai_dbmongo:${TAG} moorelab/pennai_dbmongo:${TAG}
