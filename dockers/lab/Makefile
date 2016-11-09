DOCKER_REPO=devel/lab
TAG=latest
HOSTNAME=$(shell hostname)


build:
	docker build -t ${DOCKER_REPO}:${TAG} .


run:
	docker run -i -t --rm -p 5080:5080 -h ${HOSTNAME} --name lab\
		${DOCKER_REPO}

shared:
	docker run -i -v /share:/share  -t --rm -p 5080:5080 -h  ${HOSTNAME}  --name lab --net=host\
		${DOCKER_REPO}

create:
	docker create -i -t -p 5080:5080 -h ${HOSTNAME} --name lab\
		${DOCKER_REPO}

createshared:
	docker create -i -v /share:/share -t -p 5080:5080 -h  ${HOSTNAME} --name lab\
		${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
