#working off of an ubuntu wily rootfs
FROM pennai/base:latest
WORKDIR /opt/
#ADD files/intel_opencl.tgz /
#ADD files/intel_opencl.conf /opencl_runtime_16.1.1_x64_ubuntu_6.4.0.25/
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv BC711F9BA15703C6
RUN apt-get update && apt-get install -y --allow-unauthenticated \
    mercurial subversion \
    build-essential cmake lsb-core cpio mesa-common-dev\
    libglib2.0-0 libxext6 libsm6 libxrender1 \
    --no-install-recommends
#
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
RUN echo 'export PATH=/opt/conda/bin:$PATH' > /etc/profile.d/conda.sh && \
    wget --quiet https://repo.continuum.io/archive/Anaconda3-4.2.0-Linux-x86_64.sh -O ~/anaconda.sh && \
    /bin/bash ~/anaconda.sh -b -p /opt/conda && \
    rm ~/anaconda.sh
#
ENV PATH /opt/conda/bin:$PATH
#RUN  wget --quiet https://nodejs.org/dist/v6.11.0/node-v6.11.0-linux-x64.tar.xz -O ~/node.tar.xz && \
#    tar -xvf ~/node.tar.xz -C /opt/ && \
#    rm ~/node.tar.xz
#
#ENV PATH /opt/node-v6.11.0-linux-x64/bin:$PATH
RUN pip install scikit-mdr
RUN pip install deap
RUN pip install requests_toolbelt
RUN pip install urllib3
RUN conda install scikit-learn pymongo tqdm
#RUN cd /opencl_runtime_16.1.1_x64_ubuntu_6.4.0.25/ && ./install.sh -s intel_opencl.conf
