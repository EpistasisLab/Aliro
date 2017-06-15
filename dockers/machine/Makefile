#DOCKER_REPO=localhost:5000/machine
HOSTNAME=machine
DOCKER_REPO=pennai/${HOSTNAME}
TAG=latest
LAB_HOST=lab
FGLAB_URL=http://${LAB_HOST}:5080
FGMACHINE_URL=http://${HOSTNAME}:5081
APIKEY=Oed+kIyprDrUq/3oWU5Jpyd22PqhG/CsUvI8oc9l39E=
IFROOT='/share/devel/Gp'
PS1="machine"
DOCKER_ARGS = -i -t -p 5081:5081 -e PS1=${PS1} -e FGLAB_URL=${FGLAB_URL} -e FGMACHINE_URL=${FGMACHINE_URL} -e LAB_HOST=${LAB_HOST} -e IFROOT=${IFROOT} -h ${HOSTNAME} --name ${HOSTNAME} --net=pennai\



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
	docker create -v /share:/share ${DOCKER_ARGS}\
		${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
