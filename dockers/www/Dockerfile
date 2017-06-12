#debian jessie
FROM scratch
ADD files/rootfs.tgz /
#ssh key is set to the deploy key for this app in gitlab
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		net-tools iputils-ping telnet\
		vim npm git wget openssh-client net-tools iputils-ping apache2 \
	&& rm -r /var/lib/apt/lists/*
RUN mkdir /files
RUN rm /etc/apache2/sites-enabled/*
ADD files/ports.conf /etc/apache2/
RUN cp  /etc/apache2/mods-available/rewrite* /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/ssl* /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/socache* /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/proxy.* /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/proxy_wstunnel.load /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/proxy_http.load /etc/apache2/mods-enabled
#RUN cp  /etc/apache2/mods-available/request.load /etc/apache2/mods-enabled
RUN cp  /etc/apache2/mods-available/headers.load /etc/apache2/mods-enabled
VOLUME /share
ADD files/start.sh /files/start.sh
ADD files/001-pennai.conf /etc/apache2/sites-enabled/
EXPOSE 443
CMD ["/bin/bash", "/files/start.sh"]
