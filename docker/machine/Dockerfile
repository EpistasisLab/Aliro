FROM python:3.7.16-slim-buster

ARG wheel_directory=docker/pywheels
ARG docker_filepath=docker/machine/files

RUN apt-get update --fix-missing && apt-get install -y \
    wget openssh-client openssh-server graphviz \
    net-tools iputils-ping xz-utils \
    screen ngrep \
    mercurial subversion \
    build-essential cmake cpio mesa-common-dev \
    libglib2.0-0 libxext6 libsm6 libxrender1 dos2unix \
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

# setup python environment
RUN mkdir /root/wheel
COPY ${wheel_directory}/*.whl /root/wheel/
COPY ${docker_filepath}/requirements.txt /root/
RUN pip install --no-cache-dir --find-links=/root/wheel -r /root/requirements.txt
RUN rm -rf /root/wheel

# setup node environment
RUN npm install -g pm2 --silent --progress=false

# install node_modules to an anon volume
WORKDIR /appsrc/machine

COPY machine/package.json /appsrc/machine/
COPY machine/package-lock.json /appsrc/machine/
RUN dos2unix /appsrc/machine/*.json
RUN npm install --silent --progress=false

COPY ${docker_filepath}/entrypoint.sh /root/
COPY ${docker_filepath}/wait-for-it.sh /root/
RUN dos2unix /root/wait-for-it.sh && dos2unix /root/entrypoint.sh

# clean up
RUN apt-get remove -y wget xz-utils

RUN ["chmod", "+x", "/root/wait-for-it.sh"]

CMD ["/bin/bash", "/root/entrypoint.sh"]
