FROM pennai/base:latest

# copy src for lab
COPY lab /appsrc/lab
COPY ai /appsrc/ai

WORKDIR /opt/
ARG docker_filepath=dockers/lab/files

## Webserver
RUN apt-get update --fix-missing \
	&& apt-get install -y --no-install-recommends \
  		telnet apache2 && \
	    apt-get clean && \
	    rm -rf /var/lib/apt/lists/*
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


# install lab/webapp/node_modules to an anon volume
WORKDIR /appsrc/lab/webapp
RUN dos2unix /appsrc/lab/webapp/package.json
RUN npm install --silent --progress=false

# install lab/node_modules to an anon volume
WORKDIR /appsrc/lab
RUN dos2unix /appsrc/lab/package.json
RUN npm install --silent --progress=false

## ai/metalearning python packages
RUN conda install -y -c conda-forge cython \
    xgboost simplejson numpy && \
    conda clean --all -y

### my surprise fork
RUN pip install --no-cache-dir git+https://github.com/lacava/surprise.git@master

COPY ${docker_filepath}/001-pennai.conf /etc/apache2/sites-enabled/
COPY ${docker_filepath}/htpasswd /etc/apache2/htpasswd
COPY ${docker_filepath}/certs/* /usr/lib/ssl/private/

# data directories
WORKDIR /
COPY data /appsrc/data

WORKDIR /root/

# Webserver - paiwww
COPY ${docker_filepath}/start.sh /root/

## Utility script, used when starting ai
COPY ${docker_filepath}/wait-for-it.sh /root/
RUN ["chmod", "+x", "/root/wait-for-it.sh"]


## FGLab server
COPY ${docker_filepath}/entrypoint.sh /root/
COPY ${docker_filepath}/env /opt/.env

RUN dos2unix /root/start.sh \
	&& dos2unix /root/wait-for-it.sh \
	&& dos2unix /root/entrypoint.sh

# Start the webserver
CMD ["/bin/bash", "/root/start.sh"]

EXPOSE 443
EXPOSE 5080

ENTRYPOINT ["/root/entrypoint.sh"]
