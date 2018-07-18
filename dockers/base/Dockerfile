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

# remove ssh key (it is not safe)
# ADD files/ssh.tgz /

# Anaconda 5.0.1
RUN echo 'export PATH=/opt/conda/bin:$PATH' > /etc/profile.d/conda.sh && \
    wget --quiet https://repo.continuum.io/archive/Anaconda3-5.0.1-Linux-x86_64.sh -O ~/anaconda.sh && \
    /bin/bash ~/anaconda.sh -b -p /opt/conda && \
    rm ~/anaconda.sh

# set up anaconda environment
ENV PATH /opt/conda/bin:$PATH
RUN pip install scikit-mdr
RUN pip install deap
RUN pip install requests_toolbelt
RUN pip install eli5
RUN conda install scikit-learn pymongo tqdm

COPY files/pennai.tar.gz /opt/
WORKDIR /opt/

RUN  tar -xzvf /opt/pennai.tar.gz && \
    rm /opt/pennai.tar.gz

COPY files/version /
