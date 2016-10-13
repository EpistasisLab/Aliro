#working off of an ubuntu wily rootfs
FROM scratch
ENV LANG=C.UTF-8 LC_ALL=C.UTF-8
ADD files/xenial.tgz /
#ssh key is set to the deploy key for this app in gitlab
ADD files/ssh.tgz /
ADD files/intel_opencl.tgz /
ADD files/intel_opencl.conf /opencl_runtime_16.1.1_x64_ubuntu_6.4.0.25/
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv BC711F9BA15703C6
RUN apt-get update && apt-get install -y --allow-unauthenticated \
    vim npm git openssh-client net-tools iputils-ping \
    wget \
    bzip2 ca-certificates \
    libglib2.0-0 libxext6 libsm6 libxrender1 \
    git mercurial subversion \
    build-essential \
    cmake \
    vim \
    lsb-core \
    cpio \ 
    mesa-common-dev \
#    python3-pip python3-setuptools python3-wheel python3-pandas \
#    python3-matplotlib \
#    python3-mysqldb \
#    ipython3 \
#    python3-pydot \
#    python3-tk \ 
--no-install-recommends

RUN echo 'export PATH=/opt/conda/bin:$PATH' > /etc/profile.d/conda.sh && \
    wget --quiet https://repo.continuum.io/archive/Anaconda3-4.2.0-Linux-x86_64.sh -O ~/anaconda.sh && \
    /bin/bash ~/anaconda.sh -b -p /opt/conda && \
    rm ~/anaconda.sh

ENV PATH /opt/conda/bin:$PATH
RUN pip install scikit-mdr
RUN pip install deap
RUN pip install urllib3
RUN cd /opencl_runtime_16.1.1_x64_ubuntu_6.4.0.25/ && ./install.sh -s intel_opencl.conf
ADD files/version /tmp
RUN mkdir share && mkdir /share/devel && cd /share/devel && git clone git@sarlacc.pmacs.upenn.edu:svitale/Gp.git
RUN cd /share/devel/Gp/machine && npm install 
#install bower globally, needs "node" available as "node"
RUN ln -s /usr/bin/nodejs /usr/bin/node
COPY files/start.sh /root/
COPY files/env /share/devel/Gp/machine/.env
COPY files/projects.json /share/devel/Gp/machine/
# apache configs
RUN cd /share/devel/Gp/gpocl && mkdir build && cd build && cmake ../ && make
#VOLUME /share
EXPOSE 5081
#ENTRYPOINT ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
#CMD ["/bin/bash"]
CMD ["/bin/bash", "/root/start.sh"]
