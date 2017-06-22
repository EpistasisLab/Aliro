#DOCKER_REPO=localhost:5000/machine
TAG=latest
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
ifeq ($(MACHINE_HOST),)
MACHINE_HOST := machine
endif
ifeq ($(MACHINE_PORT),)
MACHINE_PORT := 5081
endif
ifeq ($(IFROOT),)
IFROOT := /opt
endif
ifeq ($(SHARE_PATH),)
SHARE_PATH := /tmp 
endif
DOCKER_REPO=${NETWORK}/${MACHINE_HOST}
FGLAB_URL=http://${LAB_HOST}:${LAB_PORT}
FGMACHINE_URL=http://${MACHINE_HOST}:${MACHINE_PORT}
APIKEY=Oed+kIyprDrUq/3oWU5Jpyd22PqhG/CsUvI8oc9l39E=
DOCKER_ARGS = -i -t -p 5081:5081 -e FGLAB_URL=${FGLAB_URL} -e FGMACHINE_URL=${FGMACHINE_URL} -e LAB_HOST=${LAB_HOST} -e IFROOT=${IFROOT} -h ${MACHINE_HOST} --name ${MACHINE_HOST} --net=${NETWORK}\


build:
	docker build -t ${DOCKER_REPO}:${TAG} .


run:
	docker run --rm ${DOCKER_ARGS}\
		${DOCKER_REPO}


shared:
	docker run -v ${SHARE_PATH}:/share/devel --rm ${DOCKER_ARGS}\
		${DOCKER_REPO}

create:
	docker create ${DOCKER_ARGS}\
		${DOCKER_REPO}

createshared:
	docker create -v ${SHARE_PATH}:/share/devel ${DOCKER_ARGS}\
		${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
