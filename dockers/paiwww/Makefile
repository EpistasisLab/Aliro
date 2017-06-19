HOSTNAME=paiwww
DOCKER_REPO=pennai/${HOSTNAME}
TAG=latest
DOCKER_ARGS=-i -t -p 443:443 --hostname ${HOSTNAME} --name ${HOSTNAME} --net pennai 


build:
	docker build -t ${DOCKER_REPO}:${TAG} .


shared:
	docker run -v /share:/share --rm ${DOCKER_ARGS}\
		${DOCKER_REPO}

create:
	docker create -v /share:/share ${DOCKER_ARGS}\
                ${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
