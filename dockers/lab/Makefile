include ../Makevars
HOST=${LAB_HOST}
DOCKER_REPO=${NETWORK}/${HOST}
TAG=latest
DOCKER_ARGS=-i -t -p ${IP}:${LAB_PORT}:${LAB_PORT} -e FGLAB_PORT=${LAB_PORT} -e MONGODB_URI=${MONGO_URI} -e IFROOT=${PROJECTS_ROOT} -e REDIS_HOST=${REDIS_HOST} -e REDIS_PORT=${REDIS_PORT} -h ${HOST} --name ${HOST} --net=${NETWORK}\

build:
	docker build -t ${NETWORK}/${HOST}:${TAG} .


run:
	docker run --rm ${DOCKER_ARGS}\
		${NETWORK}/${HOST}

shared:
	docker run -v ${SHARE_PATH}:/share/devel --rm ${DOCKER_ARGS}\
		${NETWORK}/${HOST}

create:
	docker create ${DOCKER_ARGS}\
		${NETWORK}/${HOST}

createshared:
	docker create -i -v ${SHARE_PATH}:/share/devel  ${DOCKER_ARGS}\
		${NETWORK}/${HOST}

push:
	docker push ${REGISTRY}/${HOST}:${TAG}

tag:
	docker tag ${NETWORK}/${HOST}:${TAG} ${REGISTRY}/${HOST}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
