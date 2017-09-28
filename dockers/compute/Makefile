include ../Makevars
HOST=compute
DOCKER_REPO=${NETWORK}/${HOST}
TAG=latest

build:
	docker build -t ${NETWORK}/${HOST}:${TAG} .


run:
	echo "run? not gonna do it!"

shared:
	echo "shared? not gonna do it!"

create:
	echo "create something for you? not gonna do it!"

createshared:
	echo "create something shared for you? not gonna do it!"

push:
	docker push ${REGISTRY}/${HOST}:${TAG}

tag:
	docker tag ${NETWORK}/${HOST}:${TAG} ${REGISTRY}/${HOST}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
