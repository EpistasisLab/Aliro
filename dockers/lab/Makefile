#DOCKER_REPO=localhost:5000/lab
HOSTNAME=lab
DOCKER_REPO=pennai/${HOSTNAME}
TAG=latest
MONGODB_URI=mongodb://mongodb:27017/FGLab
FGLAB_PORT=5080
DOCKER_ARGS=-i -t --rm -p 5080:5080 -e FGLAB_PORT=${FGLAB_PORT} -e MONGODB_URI=${MONGODB_URI} -h ${HOSTNAME} --name ${HOSTNAME} --net=pennai\

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
