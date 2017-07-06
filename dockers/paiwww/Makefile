include ../Makevars
HOST=${WEB_HOST}
TAG=latest
DOCKER_REPO=${NETWORK}/${HOST}
DOCKER_ARGS=-i -t -p ${IP}:443:443 --hostname ${HOST} --name ${HOST} --net ${NETWORK}


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
