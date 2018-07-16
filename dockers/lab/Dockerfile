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

VOLUME /share

COPY files/001-pennai.conf /etc/apache2/sites-enabled/
COPY files/htpasswd /etc/apache2/htpasswd
COPY files/certs/* /usr/lib/ssl/private/


# Webserver - paiwww
COPY files/start.sh /root/
RUN dos2unix /root/start.sh
CMD ["/bin/bash", "/root/start.sh"]

## node modules as a zip for speed
COPY files/node_modules.tar.gz /root/

## FGLab server
COPY files/entrypoint.sh /root/
COPY files/env /opt/.env
RUN dos2unix /root/entrypoint.sh

WORKDIR /root/
RUN npm install -g pm2

EXPOSE 443
EXPOSE 5080

ENTRYPOINT ["/root/entrypoint.sh"]
