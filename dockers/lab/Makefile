#DOCKER_REPO=localhost:5000/lab
DOCKER_REPO=devel/lab
TAG=latest
MONGODB_URI=mongodb://localhost:27017/FGLab
FGLAB_PORT=5080
HOSTNAME=$(shell hostname)


build:
	docker build -t ${DOCKER_REPO}:${TAG} .


run:
	docker run -i -t --rm -p 5080:5080 -e FGLAB_PORT=${FGLAB_PORT} -e MONGODB_URI=${MONGODB_URI} -h ${HOSTNAME} --name lab --net=host\
		${DOCKER_REPO}

shared:
	docker run -i -v /share:/share  -t --rm -p 5080:5080 -p 8080:8080 -e FGLAB_PORT=${FGLAB_PORT} -e MONGODB_URI=${MONGODB_URI} -h  ${HOSTNAME}  --name lab --net=host\
		${DOCKER_REPO}

create:
	docker create -i -t -p 5080:5080 -e FGLAB_PORT=${FGLAB_PORT} -e MONGODB_URI=${MONGODB_URI}  -h ${HOSTNAME} --name lab --net=host\
		${DOCKER_REPO}

createshared:
	docker create -i -v /share:/share -t -p 5080:5080 -e FGLAB_PORT=${FGLAB_PORT} -e MONGODB_URI=${MONGODB_URI} -h  ${HOSTNAME} --name lab --net=host\
		${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
