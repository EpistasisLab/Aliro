#we started out with nothing
FROM debian:jessie-slim

#ubuntu wily rootfs
ADD files/rootfs.tgz /

WORKDIR /opt/

#add repo for mongodb
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv BC711F9BA15703C6
RUN echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
RUN apt-get update && apt-get install -y --allow-unauthenticated vim mongodb-org  npm git openssh-client htop dos2unix net-tools iputils-ping --no-install-recommends

#check if we need to rebuild
COPY files/mongod.conf /etc/
COPY files/users.json /root/
COPY files/projects.json /root/
COPY files/entrypoint.sh /root/
COPY files/sync.sh /root/
RUN dos2unix /root/entrypoint.sh /root/sync.sh
RUN dos2unix /root/users.json /root/projects.json
RUN dos2unix /etc/mongod.conf

VOLUME /share
EXPOSE 27017

CMD ["/bin/bash", "/root/entrypoint.sh"]
