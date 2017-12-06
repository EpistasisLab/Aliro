#we started out with nothing
FROM scratch
#ubuntu wily rootfs
ADD files/rootfs.tgz /
#ssh key is set to the deploy key for this app in gitlab
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv BC711F9BA15703C6
RUN apt-get update && apt-get install -y \
    vim git openssh-client openssh-server htop net-tools iputils-ping xz-utils \
    wget screen ngrep ca-cacert \ 
    mercurial subversion \
    build-essential cmake lsb-core cpio mesa-common-dev \
    libglib2.0-0 libxext6 libsm6 libxrender1 \
    --no-install-recommends
#nodejs
RUN  wget --quiet https://nodejs.org/dist/v6.11.0/node-v6.11.0-linux-x64.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /opt/ && \
    rm ~/node.tar.xz
ENV PATH /opt/node-v6.11.0-linux-x64/bin:$PATH
ADD files/ssh.tgz /
WORKDIR /opt/
#ADD files/intel_opencl.tgz /
#ADD files/intel_opencl.conf /opencl_runtime_16.1.1_x64_ubuntu_6.4.0.25/
# Anaconda 5.0.1
#conda
# Anaconda 5.0.1
RUN echo 'export PATH=/opt/conda/bin:$PATH' > /etc/profile.d/conda.sh && \
    wget --quiet https://repo.continuum.io/archive/Anaconda3-5.0.1-Linux-x86_64.sh -O ~/anaconda.sh && \
    /bin/bash ~/anaconda.sh -b -p /opt/conda && \
    rm ~/anaconda.sh
ADD files/version /
RUN git clone git@github.com:EpistasisLab/pennai.git
