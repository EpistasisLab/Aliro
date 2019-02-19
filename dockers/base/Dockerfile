#we started out with nothing
FROM debian:jessie-slim

#ubuntu wily rootfs
ADD files/rootfs.tgz /

#ssh key is set to the deploy key for this app in gitlab
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv BC711F9BA15703C6
RUN apt-get update && apt-get install -y \
    vim git openssh-client openssh-server htop net-tools iputils-ping xz-utils \
    wget screen ngrep ca-cacert \
    mercurial subversion \
    build-essential cmake lsb-core cpio mesa-common-dev \
    libglib2.0-0 libxext6 libsm6 libxrender1 dos2unix \
    --no-install-recommends

#nodejs
RUN  wget --quiet https://nodejs.org/dist/v6.12.3/node-v6.12.3-linux-x64.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /opt/ && \
    rm ~/node.tar.xz
ENV PATH /opt/node-v6.12.3-linux-x64/bin:$PATH

RUN npm install -g pm2

# remove ssh key (it is not safe)
# ADD files/ssh.tgz /

# Miniconda 4.5.4
RUN echo 'export PATH=/opt/conda/bin:$PATH' > /etc/profile.d/conda.sh && \
    wget --quiet https://repo.continuum.io/miniconda/Miniconda3-4.5.4-Linux-x86_64.sh -O ~/miniconda.sh && \
    /bin/bash ~/miniconda.sh -b -p /opt/conda && \
    rm ~/miniconda.sh


# set up conda environment
ENV PATH /opt/conda/bin:$PATH
RUN conda install --yes scikit-learn pymongo tqdm pandas matplotlib
RUN pip install mlxtend stopit pydot

COPY files/version /
