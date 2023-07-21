FROM alpine:3.9.6

ARG docker_filepath=/docker/dbmongo/files

RUN apk add --no-cache mongodb mongodb-tools bash

#check if we need to rebuild
COPY ${docker_filepath}/mongod.conf /etc/
COPY ${docker_filepath}/users.json /root/
COPY ${docker_filepath}/projects.json /root/
COPY ${docker_filepath}/entrypoint.sh /root/
COPY ${docker_filepath}/sync.sh /root/

EXPOSE 27017

CMD ["bin/bash", "/root/entrypoint.sh"]
