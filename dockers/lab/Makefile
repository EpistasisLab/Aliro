#DOCKER_REPO=localhost:5000/lab
ifeq ($(LAB_HOST),)
LAB_HOST := lab
endif
ifeq ($(LAB_PORT),)
LAB_PORT := 5080
endif
ifeq ($(NETWORK),)
NETWORK := pennai
endif
ifeq ($(MONGO_URI),)
DB_URI := mongodb://mongodb:27017/FGLab
endif
DOCKER_REPO=${NETWORK}/${LAB_HOST}
TAG=latest
DOCKER_ARGS=-i -t -p ${LAB_PORT}:${LAB_PORT} -e FGLAB_PORT=${LAB_PORT} -e MONGODB_URI=${DB_URI} -h ${LAB_HOST} --name ${LAB_HOST} --net=${NETWORK}\

build:
	docker build -t ${DOCKER_REPO}:${TAG} .


run:
	docker run --rm ${DOCKER_ARGS}\
		${DOCKER_REPO}

shared:
	docker run -v /share:/share --rm ${DOCKER_ARGS}\
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
