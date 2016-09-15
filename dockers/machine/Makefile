DOCKER_REPO=devel/machine
TAG=latest


build:
	docker build -t ${DOCKER_REPO}:${TAG} .


run:
	docker run -i -t --rm -p 5081:5081 --network dockernet -h machine -name machine\
		${DOCKER_REPO}

shared:
	docker run -i -v /share:/share  -t --rm -p 5081:5081 --network dockernet -h machine --name machine\
		${DOCKER_REPO}

create:
	docker create -i -t -p 5081:5081 --network dockernet -h machine --name machine\
		${DOCKER_REPO}

createshared:
	docker create -i -v /share:/share -t -p 5081:5081 --network dockernet -h machine --name machine\
		${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
