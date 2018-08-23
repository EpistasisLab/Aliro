FROM pennai/base:latest

WORKDIR /opt/

## Webserver
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
  telnet  apache2 \
	&& rm -r /var/lib/apt/lists/*
RUN mkdir /files
RUN rm /etc/apache2/sites-enabled/*
COPY files/ports.conf /etc/apache2/
RUN cp  /etc/apache2/mods-available/rewrite* /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/ssl* /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/socache* /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/proxy.* /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/proxy_wstunnel.load /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/proxy_http.load /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/headers.load /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/expires.load /etc/apache2/mods-enabled

# install node_modules to an anon volume
WORKDIR /appsrc/lab
COPY files/package.json /appsrs/lab/
RUN dos2unix /appsrs/lab/package.json
RUN npm install

## ai/metalearning
RUN pip install simplejson

VOLUME /share

COPY files/001-pennai.conf /etc/apache2/sites-enabled/
COPY files/htpasswd /etc/apache2/htpasswd
COPY files/certs/* /usr/lib/ssl/private/


WORKDIR /root/
RUN npm install -g pm2

# Webserver - paiwww
COPY files/start.sh /root/
RUN dos2unix /root/start.sh

## Utility script, used when starting ai
COPY files/wait-for-it.sh /root/
RUN dos2unix /root/wait-for-it.sh
RUN ["chmod", "+x", "/root/wait-for-it.sh"]

## node modules as a zip for speed
COPY files/node_modules.tar.gz /root/

## FGLab server
COPY files/entrypoint.sh /root/
COPY files/env /opt/.env
RUN dos2unix /root/entrypoint.sh

# Start the webserver
CMD ["/bin/bash", "/root/start.sh"]

EXPOSE 443
EXPOSE 5080

ENTRYPOINT ["/root/entrypoint.sh"]
