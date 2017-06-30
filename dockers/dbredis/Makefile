#DOCKER_REPO=localhost:5000/lab
ifeq ($(NETWORK),)
NETWORK := pennai
endif
ifeq ($(REDIS_HOST),)
REDIS_HOST :=  dbredis
endif
ifeq ($(REDIS_PORT),)
REDIS_PORT :=  6379
endif
ifeq ($(IFROOT),)
IFROOT := /opt
endif
ifeq ($(SHARE_PATH),)
SHARE_PATH := /tmp
endif

DOCKER_REPO=${NETWORK}/${REDIS_HOST}
TAG=latest
DOCKER_ARGS=-i -t -p ${REDIS_PORT}:${REDIS_PORT} -e IFROOT=${IFROOT} -h ${REDIS_HOST} --name ${REDIS_HOST} --net=${NETWORK}\

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
