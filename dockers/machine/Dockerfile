FROM python:3

#nodejs
RUN wget --quiet https://nodejs.org/dist/v11.14.0/node-v11.14.0-linux-x64.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /opt/ && \
    rm ~/node.tar.xz
ENV PATH /opt/node-v11.14.0-linux-x64/bin:$PATH

ARG docker_filepath=dockers/machine/files

RUN apt-get update && apt-get install -y \
    vim openssh-client openssh-server graphviz \
    net-tools iputils-ping xz-utils \
    screen ngrep ca-cacert \
    mercurial subversion \
    build-essential cmake lsb-core cpio mesa-common-dev \
    libglib2.0-0 libxext6 libsm6 libxrender1 dos2unix \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# setup python environment
COPY ${docker_filepath}/requirements.txt /root/
RUN pip install --no-cache-dir -r /root/requirements.txt

# setup node environment
RUN npm install -g pm2 --silent --progress=false

# install node_modules to an anon volume
WORKDIR /appsrc/machine

COPY machine/package.json /appsrc/machine/
RUN dos2unix /appsrc/machine/package.json
RUN npm install --silent --progress=false

COPY ${docker_filepath}/entrypoint.sh /root/
COPY ${docker_filepath}/wait-for-it.sh /root/
RUN dos2unix /root/wait-for-it.sh && dos2unix /root/entrypoint.sh
RUN ["chmod", "+x", "/root/wait-for-it.sh"]

CMD ["/bin/bash", "/root/entrypoint.sh"]
