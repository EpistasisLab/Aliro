TAG=latest
ifeq ($(WEB_HOST),)
WEB_HOST := paiwww
endif
ifeq ($(NETWORK),)
NETWORK := pennai
endif
ifeq ($(SHARE_PATH),)
SHARE_PATH := /tmp 
endif
DOCKER_REPO=${NETWORK}/${WEB_HOST}
DOCKER_ARGS=-i -t -p 443:443 --hostname ${WEB_HOST} --name ${WEB_HOST} --net ${NETWORK}


build:
	docker build -t ${DOCKER_REPO}:${TAG} .


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
