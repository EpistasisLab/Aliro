FROM pennai/base:latest

WORKDIR /opt/
ARG docker_filepath=dockers/machine/files

COPY ${docker_filepath}/env pennai/machine/.env
RUN cd pennai/ && mkdir tmp && cd machine && npm -g install pm2

# install node_modules to an anon volume
WORKDIR /appsrc/machine
COPY machine/package.json /appsrc/machine/
RUN dos2unix /appsrc/machine/package.json
RUN npm install

COPY ${docker_filepath}/entrypoint.sh /root/
COPY ${docker_filepath}/wait-for-it.sh /root/
RUN dos2unix /root/wait-for-it.sh && dos2unix /root/entrypoint.sh
RUN ["chmod", "+x", "/root/wait-for-it.sh"]

VOLUME /share
EXPOSE 5081

CMD ["/bin/bash", "/root/entrypoint.sh"]
