DOCKER_REPO=devel/lab
TAG=latest


build:
	docker build -t ${DOCKER_REPO}:${TAG} .


run:
	docker run -i -t --rm -p 5080:5080 --name lab\
		${DOCKER_REPO}

shared:
	docker run -i -v /share:/share  -t --rm -p 5080:5080 --name lab\
		${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
