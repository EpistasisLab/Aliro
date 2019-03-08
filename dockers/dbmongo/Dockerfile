FROM ubuntu:xenial
WORKDIR /opt/

#add repo for mongodb
RUN echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
RUN apt-get update && \
  apt-get install -y --allow-unauthenticated \
  vim mongodb-org npm openssh-client htop dos2unix \
  net-tools iputils-ping \
  --no-install-recommends && \
  apt-get clean && \
  rm -rf /var/lib/apt/lists/*

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
