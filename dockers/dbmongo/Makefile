#DOCKER_REPO=localhost:5000/lab
ifeq ($(NETWORK),)
NETWORK := pennai
endif
ifeq ($(MONGO_HOST),)
MONGO_HOST :=  dbmongo
endif
ifeq ($(MONGO_PORT),)
MONGO_PORT :=  27017
endif
ifeq ($(IFROOT),)
IFROOT := /opt
endif
ifeq ($(SHARE_PATH),)
SHARE_PATH := /tmp
endif

DOCKER_REPO=${NETWORK}/${MONGO_HOST}
TAG=latest
DOCKER_ARGS=-i -t -p 127.0.0.67:${MONGO_PORT}:${MONGO_PORT} -e IFROOT=${IFROOT} -h ${MONGO_HOST} --name ${MONGO_HOST} --net=${NETWORK}\

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
