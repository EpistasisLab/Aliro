DOCKER_NAME=nvdeb
DOCKER_REPO=epistasis/${DOCKER_NAME}
TAG=latest
DEVICES=--device /dev/nvidia0:/dev/nvidia0 --device /dev/nvidia1:/dev/nvidia1  --device /dev/nvidiactl:/dev/nvidiactl --device /dev/nvidia-uvm:/dev/nvidia-uvm


build:
	docker build -t ${DOCKER_REPO}:${TAG} .


run:
	docker run -i -v /share:/share -t --rm --name gp\
        ${DEVICES} \
	${DOCKER_REPO}

push:
	docker push ${DOCKER_REPO}:${TAG}

connect:
	sh connect.sh

clean:
	sh killall.sh

.PHONY: build run push
