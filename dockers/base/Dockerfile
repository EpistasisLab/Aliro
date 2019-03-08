FROM continuumio/miniconda3

RUN apt-get update --fix-missing && apt-get install -y \
    vim openssh-client openssh-server htop net-tools iputils-ping xz-utils \
    screen ngrep ca-cacert \
    mercurial subversion \
    build-essential cmake lsb-core cpio mesa-common-dev \
    libglib2.0-0 libxext6 libsm6 libxrender1 dos2unix \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

#nodejs
RUN  wget --quiet https://nodejs.org/dist/v6.12.3/node-v6.12.3-linux-x64.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /opt/ && \
    rm ~/node.tar.xz
ENV PATH /opt/node-v6.12.3-linux-x64/bin:$PATH

RUN npm install -g pm2


# set up conda environment
ENV PATH /opt/conda/bin:$PATH
RUN conda install --y scikit-learn=0.20.2 pymongo tqdm pandas matplotlib

COPY files/version /
