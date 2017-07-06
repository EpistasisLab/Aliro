#DOCKER_REPO=localhost:5000/machine
include ../Makevars
HOST=${PAIX_HOST}
TAG=latest
DOCKER_REPO=${NETWORK}/${HOST}
DOCKER_ARGS = -i -t -p 5082:5082 -e APIKEY=${APIKEY} -e FGLAB_URL=${LAB_URL} -e LAB_HOST=${LAB_HOST} -e IFROOT=${PROJECTS_ROOT} -e MONGODB_URI=${MONGO_URI} -h ${HOST} --name ${HOST} --net=${NETWORK}\


build:
	docker build -t ${DOCKER_REPO}:${TAG} .


run:
	docker run --rm ${DOCKER_ARGS}\
		${DOCKER_REPO}


shared:
	docker run -v ${SHARE_PATH}:/share/devel --rm ${DOCKER_ARGS}\
		${DOCKER_REPO}

create:
	docker create ${DOCKER_ARGS}\
		${DOCKER_REPO}

createshared:
	docker create -v ${SHARE_PATH}:/share/devel ${DOCKER_ARGS}\
		${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
