#working off of an ubuntu wily rootfs
FROM scratch
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
WORKDIR /opt/
ADD files/rootfs.tgz /
#ssh for deploy from git
ADD files/ssh.tgz /
#ADD files/intel_opencl.tgz /
#ADD files/intel_opencl.conf /opencl_runtime_16.1.1_x64_ubuntu_6.4.0.25/
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv BC711F9BA15703C6
RUN apt-get update && apt-get install -y --allow-unauthenticated \
    vim wget git openssh-client net-tools iputils-ping htop\
    git mercurial subversion \
    bzip2 ca-certificates \
    build-essential cmake lsb-core cpio mesa-common-dev\
    libglib2.0-0 libxext6 libsm6 libxrender1 \
    openssh-server \
--no-install-recommends

RUN echo 'export PATH=/opt/conda/bin:$PATH' > /etc/profile.d/conda.sh && \
    wget --quiet https://repo.continuum.io/archive/Anaconda3-4.2.0-Linux-x86_64.sh -O ~/anaconda.sh && \
    /bin/bash ~/anaconda.sh -b -p /opt/conda && \
    rm ~/anaconda.sh
ENV PATH /opt/conda/bin:$PATH
RUN  wget --quiet https://nodejs.org/dist/v6.11.0/node-v6.11.0-linux-x64.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /opt/ && \
    rm ~/node.tar.xz
ENV PATH /opt/node-v6.11.0-linux-x64/bin:$PATH
RUN pip install scikit-mdr
RUN pip install deap
RUN pip install requests_toolbelt
RUN pip install urllib3
RUN conda install scikit-learn pymongo tqdm
#RUN cd /opencl_runtime_16.1.1_x64_ubuntu_6.4.0.25/ && ./install.sh -s intel_opencl.conf
#RUN mkdir share && mkdir /share/devel && cd /share/devel && git clone git@github.com:EpistasisLab/Gp.git
ADD files/version /tmp
RUN git clone -b aws git@github.com:EpistasisLab/Gp.git
RUN cd Gp/machine && npm install && npm -g install pm2
COPY files/start.sh /root/
COPY files/env Gp/machine/.env
VOLUME /share
EXPOSE 5081
#ENTRYPOINT ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
#CMD ["/bin/bash"]
CMD ["/bin/bash", "/root/start.sh"]
