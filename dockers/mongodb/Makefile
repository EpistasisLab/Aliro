#DOCKER_REPO=localhost:5000/lab
DOCKER_REPO=pennai/mongodb
TAG=latest
DOCKER_ARGS=-i -t -p 27017:27017 -h mongodb --name mongodb --net=pennai\

build:
	docker build -t ${DOCKER_REPO}:${TAG} .


run:
	docker run ${DOCKER_ARGS}\
		${DOCKER_REPO}

shared:
	docker run -v /share:/share  ${DOCKER_ARGS}\
		${DOCKER_REPO}

create:
	docker create ${DOCKER_ARGS}\
		${DOCKER_REPO}

createshared:
	docker create -i -v /share:/share ${DOCKER_ARGS}\
		${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
