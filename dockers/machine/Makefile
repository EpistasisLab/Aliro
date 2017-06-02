#DOCKER_REPO=localhost:5000/machine
DOCKER_REPO=devel/machine
TAG=latest
HOSTNAME=$(shell hostname)
LAB_HOST=${HOSTNAME}
FGLAB_URL=http://${LAB_HOST}:5080
FGMACHINE_URL=http://${HOSTNAME}:5081
APIKEY=Oed+kIyprDrUq/3oWU5Jpyd22PqhG/CsUvI8oc9l39E=
IFROOT='/share/devel/Gp'
PS1="machine"



build:
	docker build -t ${DOCKER_REPO}:${TAG} .


run:
	docker run -i -t --rm -p 5081:5081 -e PS1=${PS1} -e FGLAB_URL=${FGLAB_URL} -e FGMACHINE_URL=${FGMACHINE_URL} -e LAB_HOST=${LAB_HOST} -e IFROOT=${IFROOT} -h ${HOSTNAME} --name machine --net=host\
		${DOCKER_REPO}


shared:
	docker run -i -v /share:/share -t --rm -p 5081:5081 -e APIKEY=${APIKEY} -e PS1=${PS1} -e FGLAB_URL=${FGLAB_URL} -e FGMACHINE_URL=${FGMACHINE_URL} -e LAB_HOST=${LAB_HOST} -e IFROOT=${IFROOT} -h ${HOSTNAME} --name machine --net=host\
		${DOCKER_REPO}
#	docker run -i -v /share:/share  -t --rm -p 5081:5081 -e FGLAB_URL=${FGLAB_URL} -e FGMACHINE_URL=${FGMACHINE_URL} -e LAB_HOST=${LAB_HOST} -e IFROOT=${IFROOT} -h ${HOSTNAME} --name machine --net=host\

create:
	docker create -i -t -p 5081:5081 -e FGLAB_URL=${FGLAB_URL} -e FGMACHINE_URL=${FGMACHINE_URL} -e LAB_HOST=${LAB_HOST} -e IFROOT=${IFROOT} -h ${HOSTNAME} -h machine --name machine --net=host\
		${DOCKER_REPO}

createshared:
	docker create -i -v /share:/share -t -p 5081:5081 -e FGLAB_URL=${FGLAB_URL} -e FGMACHINE_URL=${FGMACHINE_URL} -e LAB_HOST=${LAB_HOST} -e IFROOT=${IFROOT} -h ${HOSTNAME} -h machine --name machine --net=host\
		${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
