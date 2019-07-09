FROM continuumio/miniconda3:4.6.14

RUN apt-get update --fix-missing && apt-get install -y \
    vim openssh-client openssh-server htop net-tools iputils-ping xz-utils \
    screen ngrep ca-cacert telnet apache2 \
    mercurial subversion \
    build-essential cmake lsb-core cpio mesa-common-dev \
    libglib2.0-0 libxext6 libsm6 libxrender1 dos2unix \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

ARG docker_filepath=dockers/lab/files

# set conda config for faster build
RUN conda config --set channel_priority strict
COPY ${docker_filepath}/environment.yml /appsrc/lab/
RUN dos2unix /appsrc/lab/environment.yml && \
		conda env update -f /appsrc/lab/environment.yml

### bill's surprise fork
RUN pip install --no-cache-dir git+https://github.com/lacava/surprise.git@master


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

# install pm2
RUN npm install -g pm2 --silent --progress=false

# install lab/webapp/node_modules to an anon volume
WORKDIR /appsrc/lab/webapp
COPY lab/webapp/package.json /appsrc/lab/webapp/
RUN dos2unix /appsrc/lab/webapp/package.json
RUN npm install --silent --progress=false

# install lab/node_modules to an anon volume
WORKDIR /appsrc/lab
COPY lab/package.json /appsrc/lab/
RUN dos2unix /appsrc/lab/package.json
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


## PennAI Lab server
COPY ${docker_filepath}/entrypoint.sh /root/

RUN dos2unix /root/start.sh \
	&& dos2unix /root/wait-for-it.sh \
	&& dos2unix /root/entrypoint.sh


# Start the webserver
CMD ["/bin/bash", "/root/start.sh"]

EXPOSE 443
EXPOSE 5080
WORKDIR /appsrc/lab/
ENTRYPOINT ["/root/entrypoint.sh"]
