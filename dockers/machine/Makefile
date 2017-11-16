include ../Makevars
TAG=latest
HOST=${MACHINE_HOST}
DOCKER_ARGS = -i -t -p ${MACHINE_PORT}:${MACHINE_PORT} -e FGLAB_URL=http://${LAB_HOST}:${LAB_PORT} -e FGMACHINE_URL=http://${MACHINE_HOST}:${MACHINE_PORT} -e LAB_HOST=${LAB_HOST} -e PROJECT_ROOT=${PROJECT_ROOT} -e CAPACITY=${CAPACITY} -h ${HOST} --name ${HOST} --net=${NETWORK}\

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
