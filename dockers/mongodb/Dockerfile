#working off of an ubuntu wily rootfs
FROM scratch
ADD files/rootfs.tgz /
#ssh key is set to the deploy key for this app in gitlab
ADD files/ssh.tgz /
#add repo for mongodb
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv BC711F9BA15703C6
RUN echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
RUN apt-get update && apt-get install -y --allow-unauthenticated vim mongodb-org  npm git openssh-client htop net-tools iputils-ping --no-install-recommends
#check if we need to rebuild
ADD files/version /tmp
#add Gp sourcecode || not needed if mounting /share
VOLUME /share
ADD files/mongodump.tgz /
COPY files/.mongo* /root/
COPY files/mongod.conf /etc/
COPY files/users.json /root/
COPY files/start.sh /root/
EXPOSE 27017
CMD ["/bin/bash", "/root/start.sh"]
