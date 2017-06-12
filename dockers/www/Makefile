DOCKER_REPO=pennai/www
TAG=latest
DOCKER_ARGS=-i -t -p 443:443 --hostname www --name www --net pennai 


build:
	docker build -t ${DOCKER_REPO}:${TAG} .


shared:
	docker run -v /share:/share ${DOCKER_ARGS}\
		${DOCKER_REPO}

createshared:
	docker create -v /share:/share ${DOCKER_ARGS}\
                ${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
