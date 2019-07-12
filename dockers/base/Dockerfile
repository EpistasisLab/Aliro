FROM continuumio/miniconda3:4.6.14

RUN apt-get update --fix-missing && apt-get install -y \
    vim openssh-client openssh-server \
    net-tools iputils-ping xz-utils \
    screen ngrep ca-cacert \
    mercurial subversion \
    build-essential cmake lsb-core cpio mesa-common-dev \
    libglib2.0-0 libxext6 libsm6 libxrender1 dos2unix \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# set conda config for faster build
RUN conda config --set channel_priority strict

# set up conda environment
RUN conda install -y -S -c conda-forge \
    nodejs=11.14.0 \
    scikit-learn=0.20.2 \
    tqdm=4.32.2 \
    pymongo=3.8.0 \
    pandas=0.24.2 \
    matplotlib=3.1.1 && \
    conda clean --all -y

RUN npm install -g pm2 --silent --progress=false
