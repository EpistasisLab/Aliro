# Stage 1: Build and compile dependencies
FROM python:3.7.16-slim-buster as base

ARG USE_WHEELS
ARG wheel_directory=docker/wheels
ARG docker_filepath=docker/lab/files

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

# Setup python environment
RUN mkdir /root/wheel
COPY ${wheel_directory}/*.whl /root/wheel/
COPY ${docker_filepath}/requirements.txt /root/
RUN if [ ${USE_WHEELS} -eq 1 ] ; \
  then pip install --no-index --find-links=/root/wheel -r /root/requirements.txt ; \
  else pip install --no-cache-dir -r /root/requirements.txt ; \
  fi
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

# Setup node environment
RUN npm install -g pm2 --silent --progress=false

# Install lab/webapp/node_modules to an anonymous volume
WORKDIR /appsrc/lab/webapp
COPY lab/webapp/package.json /appsrc/lab/webapp/
COPY lab/webapp/package-lock.json /appsrc/lab/webapp/
RUN dos2unix /appsrc/lab/webapp/*.json
RUN npm install --silent --progress=false

# Install lab/node_modules to an anonymous volume
WORKDIR /appsrc/lab
COPY lab/package.json /appsrc/lab/
COPY lab/package-lock.json /appsrc/lab/
RUN dos2unix /appsrc/lab/*.json
RUN npm install --silent --progress=false

# Stage 2a: build dev version of lab
FROM python:3.7.16-slim-buster as dev

ARG docker_filepath=docker/lab/files

# Copy installed packages from the builder stage
COPY --from=base /usr/local /usr/local

# Copy Apache configuration
COPY --from=base /etc/apache2 /etc/apache2

# Copy webapp and lab source code
COPY --from=base /appsrc/lab /appsrc/lab

# Copy scripts and other files
COPY ${docker_filepath}/start.sh /root/
COPY ${docker_filepath}/wait-for-it.sh /root/
COPY ${docker_filepath}/entrypoint.sh /root/
COPY ${docker_filepath}/001-pennai.conf /etc/apache2/sites-enabled/
COPY ${docker_filepath}/htpasswd /etc/apache2/htpasswd
COPY ${docker_filepath}/certs/* /usr/lib/ssl/private/
COPY .env /etc/profile.d/

# These requirements need to be built, using wheels throws errors
COPY ${docker_filepath}/requirements-build.txt /root/

# Set version and build environment
ENV BUILD_ENV='dev'
RUN apt-get update && apt-get install -y dos2unix git build-essential && \
    pip install --no-cache-dir -r /root/requirements-build.txt && \
    cp '/etc/profile.d/.env' '/etc/profile.d/tag.sh' && \
    dos2unix /etc/profile.d/tag.sh && \
    sed -i "s/TAG=/export TAG=/g" /etc/profile.d/tag.sh && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get remove -y dos2unix git build-essential && \
    apt-get autoremove -y && \
    apt-get clean && \
    chmod +x /root/*.sh

# Expose ports and set working directory
EXPOSE 5080
WORKDIR /appsrc/lab/

# Start the webserver
CMD ["/bin/bash", "/root/start.sh"]

# Entrypoint
ENTRYPOINT ["/root/entrypoint.sh"]

# Stage 2b: build prod version of lab
FROM python:3.7.16-slim-buster as prod
ARG docker_filepath=docker/lab/files

# Copy src for lab
COPY lab /appsrc/lab
COPY ai /appsrc/ai

# Copy installed packages from the builder stage
COPY --from=base /usr/local /usr/local

# Copy Apache configuration
COPY --from=base /etc/apache2 /etc/apache2

# Copy webapp and lab source code
COPY --from=base /appsrc/lab /appsrc/lab

# Copy scripts and other files
COPY ${docker_filepath}/start.sh /root/
COPY ${docker_filepath}/wait-for-it.sh /root/
COPY ${docker_filepath}/entrypoint.sh /root/
COPY ${docker_filepath}/001-pennai.conf /etc/apache2/sites-enabled/
COPY ${docker_filepath}/htpasswd /etc/apache2/htpasswd
COPY ${docker_filepath}/certs/* /usr/lib/ssl/private/
COPY .env /etc/profile.d/

# These requirements need to be built, using wheels throws errors
COPY ${docker_filepath}/requirements-build.txt /root/

# Copy knowledgebases
COPY 'data/knowledgebases/sklearn-benchmark-data-knowledgebase-r6.tsv.gz' /appsrc/data/knowledgebases/
COPY 'data/knowledgebases/pmlb_classification_metafeatures.csv.gz' /appsrc/data/knowledgebases/
COPY 'data/knowledgebases/pmlb_regression_results.pkl.gz' /appsrc/data/knowledgebases/
COPY 'data/knowledgebases/pmlb_regression_metafeatures.csv.gz' /appsrc/data/knowledgebases/

# Set version and build environment
ENV BUILD_ENV='prod'
RUN apt-get update && apt-get install -y dos2unix git build-essential && \
    pip install --no-cache-dir -r /root/requirements-build.txt && \
    cp '/etc/profile.d/.env' '/etc/profile.d/tag.sh' && \
    dos2unix /etc/profile.d/tag.sh && \
    sed -i "s/TAG=/export TAG=/g" /etc/profile.d/tag.sh && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get remove -y dos2unix git build-essential && \
    apt-get autoremove -y && \
    apt-get clean && \
    chmod +x /root/*.sh

# Expose ports and set working directory
EXPOSE 5080
WORKDIR /appsrc/lab/

# Start the webserver
CMD ["/bin/bash", "/root/start.sh"]

# Entrypoint
ENTRYPOINT ["/root/entrypoint.sh"]
