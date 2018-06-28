FROM pennai/base:latest

WORKDIR /opt/

## Redis and Webserver
# add our user and group first to make sure their IDs get assigned consistently, regardless of whatever dependencies get added
RUN groupadd -r redis && useradd -r -g redis redis

# grab gosu for easy step-down from root
# https://github.com/tianon/gosu/releases
ENV GOSU_VERSION 1.10
RUN set -ex; \
	\
	fetchDeps='ca-certificates wget'; \
	apt-get update; \
	apt-get install -y --no-install-recommends $fetchDeps; \
	rm -rf /var/lib/apt/lists/*; \
	\
	dpkgArch="$(dpkg --print-architecture | awk -F- '{ print $NF }')"; \
	wget -O /usr/local/bin/gosu "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch"; \
	wget -O /usr/local/bin/gosu.asc "https://github.com/tianon/gosu/releases/download/$GOSU_VERSION/gosu-$dpkgArch.asc"; \
	export GNUPGHOME="$(mktemp -d)"; \
	gpg --keyserver ha.pool.sks-keyservers.net --recv-keys B42F6819007F00F88E364FD4036A9C25BF357DD4; \
	gpg --batch --verify /usr/local/bin/gosu.asc /usr/local/bin/gosu; \
	rm -r "$GNUPGHOME" /usr/local/bin/gosu.asc; \
	chmod +x /usr/local/bin/gosu; \
	gosu nobody true; \
	\
	apt-get purge -y --auto-remove $fetchDeps

ENV REDIS_VERSION 3.2.9
ENV REDIS_DOWNLOAD_URL http://download.redis.io/releases/redis-3.2.9.tar.gz
ENV REDIS_DOWNLOAD_SHA 6eaacfa983b287e440d0839ead20c2231749d5d6b78bbe0e0ffa3a890c59ff26

# for redis-sentinel see: http://redis.io/topics/sentinel
RUN set -ex; \
	\
	buildDeps=' \
		wget \
		\
		gcc \
		libc6-dev \
		make \
	'; \
	apt-get update; \
	apt-get install -y $buildDeps --no-install-recommends; \
	rm -rf /var/lib/apt/lists/*; \
	\
	wget -O redis.tar.gz "$REDIS_DOWNLOAD_URL"; \
	echo "$REDIS_DOWNLOAD_SHA *redis.tar.gz" | sha256sum -c -; \
	mkdir -p /usr/src/redis; \
	tar -xzf redis.tar.gz -C /usr/src/redis --strip-components=1; \
	rm redis.tar.gz; \
	\
# disable Redis protected mode [1] as it is unnecessary in context of Docker
# (ports are not automatically exposed when running inside Docker, but rather explicitly by specifying -p / -P)
# [1]: https://github.com/antirez/redis/commit/edd4d555df57dc84265fdfb4ef59a4678832f6da
	grep -q '^#define CONFIG_DEFAULT_PROTECTED_MODE 1$' /usr/src/redis/src/server.h; \
	sed -ri 's!^(#define CONFIG_DEFAULT_PROTECTED_MODE) 1$!\1 0!' /usr/src/redis/src/server.h; \
	grep -q '^#define CONFIG_DEFAULT_PROTECTED_MODE 0$' /usr/src/redis/src/server.h; \
# for future reference, we modify this directly in the source instead of just supplying a default configuration flag because apparently "if you specify any argument to redis-server, [it assumes] you are going to specify everything"
# see also https://github.com/docker-library/redis/issues/4#issuecomment-50780840
# (more exactly, this makes sure the default behavior of "save on SIGTERM" stays functional by default)
	\
	make -C /usr/src/redis -j "$(nproc)"; \
	make -C /usr/src/redis install; \
	\
	rm -r /usr/src/redis; \
	\
	apt-get purge -y --auto-remove $buildDeps
RUN apt-get update && apt-get install -y --allow-unauthenticated --no-install-recommends dos2unix
RUN mkdir /data && chown redis:redis /data
VOLUME /data
WORKDIR /data

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


# paiwww
COPY files/start.sh /root/
RUN dos2unix /root/start.sh
CMD ["/bin/bash", "/root/start.sh"]

# dbredis
COPY files/dbredis-entrypoint.sh /usr/local/bin/
COPY files/node_modules.tar.gz /root/
RUN dos2unix /usr/local/bin/dbredis-entrypoint.sh
CMD ["/bin/bash", "/usr/local/bin/dbredis-entrypoint.sh"]
CMD ["redis-server","--daemonize","yes"]

## FGLab server
COPY files/entrypoint.sh /root/
COPY files/env /opt/.env
RUN dos2unix /root/entrypoint.sh

WORKDIR /root/
RUN npm install -g pm2

EXPOSE 443
EXPOSE 5080

ENTRYPOINT ["/root/entrypoint.sh"]
