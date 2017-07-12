#DOCKER_REPO=localhost:5000/lab
include ../Makevars
HOST=${MONGO_HOST}
DOCKER_REPO=${NETWORK}/${HOST}
TAG=latest
DOCKER_ARGS=-i -t -p ${IP}:${MONGO_PORT}:${MONGO_PORT} -e IFROOT=${PROJECTS_ROOT} -h ${HOST} --name ${HOST} --net=${NETWORK}\

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
	docker create -i -v ${SHARE_PATH}:/share/devel  ${DOCKER_ARGS}\
		${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
