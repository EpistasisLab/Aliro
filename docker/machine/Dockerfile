# Stage 1: Build and install Python and Node.js dependencies
FROM python:3.7.16-slim-buster AS builder

ARG USE_WHEELS
ARG wheel_directory=docker/wheels
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

# Setup python environment
RUN mkdir /root/wheel
COPY ${wheel_directory}/*.whl /root/wheel/
COPY ${docker_filepath}/requirements.txt /root/
RUN if [ ${USE_WHEELS} -eq 1 ] ; \
    then pip install --no-index --find-links=/root/wheel -r /root/requirements.txt ; \
    else pip install --no-cache-dir -r /root/requirements.txt ; \
  fi
RUN rm -rf /root/wheel

# These requirements need to be built, using wheels throws errors
COPY ${docker_filepath}/requirements-build.txt /root/
RUN pip install --no-cache-dir -r /root/requirements-build.txt

# Setup node environment
RUN npm install -g pm2 --silent --progress=false

# Stage 2: Final runtime image
FROM python:3.7.16-slim-buster

ARG docker_filepath=docker/machine/files

# Copy installed Python dependencies
COPY --from=builder /usr/local /usr/local

# Copy node_modules to an anonymous volume
WORKDIR /appsrc/machine
COPY machine/package.json /appsrc/machine/
COPY machine/package-lock.json /appsrc/machine/
# Copy entrypoint script and other files
COPY ${docker_filepath}/entrypoint.sh /root/
COPY ${docker_filepath}/wait-for-it.sh /root/

RUN apt-get update && apt-get install -y graphviz dos2unix && \
    dos2unix /appsrc/machine/*.json && \
    npm install --silent --progress=false && \
    dos2unix /root/wait-for-it.sh && dos2unix /root/entrypoint.sh && \
    chmod +x /root/wait-for-it.sh && chmod +x /root/entrypoint.sh && \
    apt-get remove -y dos2unix && \
    apt-get clean
    # apt-get autoremove -y && \

CMD ["/bin/bash", "/root/entrypoint.sh"]

