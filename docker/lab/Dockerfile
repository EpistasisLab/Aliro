FROM python:3.7.16-slim-buster

ARG USE_WHEELS
ARG wheel_directory=docker/wheels

RUN apt-get update --fix-missing && \
    apt-get install -y wget xz-utils git \
    openssh-client openssh-server telnet apache2 \
    net-tools iputils-ping \
    screen ngrep \
    mercurial subversion \
    build-essential cmake cpio mesa-common-dev \
    dos2unix \
    --no-install-recommends && \
    ARCH= && dpkgArch="$(dpkg --print-architecture)" \
    && case "${dpkgArch##*-}" in \
      amd64) ARCH='x64';; \
      ppc64el) ARCH='ppc64le';; \
      s390x) ARCH='s390x';; \
      arm64) ARCH='arm64';; \
      armhf) ARCH='armv7l';; \
      i386) ARCH='x86';; \
      *) echo "unsupported architecture"; exit 1 ;; \
    esac \
    && wget --quiet https://nodejs.org/dist/v16.18.1/node-v16.18.1-linux-$ARCH.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /usr/local/ --strip-components=1 --no-same-owner && \
    rm ~/node.tar.xz && \
    ln -s /usr/local/bin/node /usr/local/bin/nodejs && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get remove -y wget && \
    apt-get clean

ARG docker_filepath=docker/lab/files

# RUN apt-get update --fix-missing && apt-get install -y \
#     vim openssh-client openssh-server telnet apache2 \
#     net-tools iputils-ping xz-utils \
#     screen ngrep ca-cacert \
#     mercurial subversion \
#     build-essential cmake lsb-core cpio mesa-common-dev \
#     dos2unix \
#     --no-install-recommends && \
#     apt-get clean && \
#     rm -rf /var/lib/apt/lists/*

# setup python environment
RUN mkdir /root/wheel
COPY ${wheel_directory}/*.whl /root/wheel/
COPY ${docker_filepath}/requirements.txt /root/
RUN if [ ${USE_WHEELS} -eq 1 ] ; then pip install --no-index --find-links=/root/wheel -r /root/requirements.txt ; else pip install --no-cache-dir -r /root/requirements.txt ; fi
RUN rm /root/wheel/*.whl

## Webserver

RUN rm /etc/apache2/sites-enabled/*
COPY ${docker_filepath}/ports.conf /etc/apache2/
RUN cp  /etc/apache2/mods-available/rewrite* /etc/apache2/mods-enabled \
	&& cp /etc/apache2/mods-available/ssl* /etc/apache2/mods-enabled \
	&& cp /etc/apache2/mods-available/socache* /etc/apache2/mods-enabled \
	&& cp /etc/apache2/mods-available/proxy.* /etc/apache2/mods-enabled \
	&& cp /etc/apache2/mods-available/proxy_wstunnel.load /etc/apache2/mods-enabled \
	&& cp /etc/apache2/mods-available/proxy_http.load /etc/apache2/mods-enabled \
	&& cp /etc/apache2/mods-available/headers.load /etc/apache2/mods-enabled \
	&& cp /etc/apache2/mods-available/expires.load /etc/apache2/mods-enabled

# setup node environment
RUN npm install -g pm2 --silent --progress=false

# install lab/webapp/node_modules to an anon volume
WORKDIR /appsrc/lab/webapp
COPY lab/webapp/package.json /appsrc/lab/webapp/
COPY lab/webapp/package-lock.json /appsrc/lab/webapp/
RUN dos2unix /appsrc/lab/webapp/*.json
RUN npm install --silent --progress=false

# install lab/node_modules to an anon volume
WORKDIR /appsrc/lab
COPY lab/package.json /appsrc/lab/
COPY lab/package-lock.json /appsrc/lab/
RUN dos2unix /appsrc/lab/*.json
RUN npm install --silent --progress=false

COPY ${docker_filepath}/001-pennai.conf /etc/apache2/sites-enabled/
COPY ${docker_filepath}/htpasswd /etc/apache2/htpasswd
COPY ${docker_filepath}/certs/* /usr/lib/ssl/private/

WORKDIR /root/

# Webserver - paiwww
COPY ${docker_filepath}/start.sh /root/

## Utility script, used when starting ai
COPY ${docker_filepath}/wait-for-it.sh /root/
RUN ["chmod", "+x", "/root/wait-for-it.sh"]


## Aliro Lab server
COPY ${docker_filepath}/entrypoint.sh /root/
RUN ["chmod", "+x", "/root/entrypoint.sh"]

RUN dos2unix /root/start.sh \
	&& dos2unix /root/wait-for-it.sh \
	&& dos2unix /root/entrypoint.sh

# set version and build environment; tag.sh is sourced in entrypoint.sh
ENV BUILD_ENV='dev'
COPY .env /etc/profile.d/
RUN cp '/etc/profile.d/.env' '/etc/profile.d/tag.sh'
RUN dos2unix /etc/profile.d/tag.sh
RUN sed -i "s/TAG=/export TAG=/g" /etc/profile.d/tag.sh

# clean up
RUN apt-get remove -y wget xz-utils


# Start the webserver
CMD ["/bin/bash", "/root/start.sh"]

# EXPOSE 443
EXPOSE 5080
WORKDIR /appsrc/lab/
ENTRYPOINT ["/root/entrypoint.sh"]
