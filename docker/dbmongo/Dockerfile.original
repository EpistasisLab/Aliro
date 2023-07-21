FROM mongo:4.4.18
WORKDIR /opt/

ARG docker_filepath=docker/dbmongo/files

RUN apt-get update && apt-get install -y dos2unix

# RUN apt-get update
# RUN apt-get install gpg wget
# RUN wget -O - https://apt.kitware.com/keys/kitware-archive-latest.asc 2>/dev/null | gpg --dearmor - | sudo tee /usr/share/keyrings/kitware-archive-keyring.gpg >/dev/null
# RUN apt-get update


#add repo for mongodb
# RUN echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
# RUN apt-get update --fix-missing && \
#   apt-get install -y --allow-unauthenticated \
#   vim mongodb-org npm openssh-client htop dos2unix \
#   net-tools iputils-ping \
#   --no-install-recommends && \
#   apt-get clean && \
#   rm -rf /var/lib/apt/lists/*

#check if we need to rebuild
COPY ${docker_filepath}/mongod.conf /etc/
COPY ${docker_filepath}/users.json /root/
COPY ${docker_filepath}/projects.json /root/
COPY ${docker_filepath}/entrypoint.sh /root/
COPY ${docker_filepath}/sync.sh /root/
RUN dos2unix /root/entrypoint.sh /root/sync.sh
RUN dos2unix /root/users.json /root/projects.json
RUN dos2unix /etc/mongod.conf
RUN apt-get remove -y dos2unix && apt-get clean

EXPOSE 27017

CMD ["/bin/bash", "/root/entrypoint.sh"]
