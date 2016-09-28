#working off of an ubuntu wily rootfs
FROM scratch
ADD files/xenial.tgz /
#ssh key is set to the deploy key for this app in gitlab
ADD files/ssh.tgz /
ADD files/intel_opencl.tgz /
ADD files/intel_opencl.conf /opencl_runtime_16.1.1_x64_ubuntu_6.4.0.25/
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv BC711F9BA15703C6
RUN apt-get update && apt-get install -y --allow-unauthenticated vim npm git openssh-client net-tools iputils-ping python3-pip python3-setuptools python3-wheel python3-pandas \
    wget \
    build-essential \
    cmake \
    vim \
    lsb-core \
    cpio \ 
    mesa-common-dev \
    python3-matplotlib \
    python3-mysqldb \
    ipython3 \
    python3-pydot \
    python3-tk \ 
--no-install-recommends

RUN pip3 install scikit-mdr
RUN mkdir share && mkdir /share/devel && cd /share/devel && git clone git@devel.ceet.upenn.edu:IBI/Gp.git
RUN cd /share/devel/Gp/machine && npm install 
#install bower globally, needs "node" available as "node"
RUN ln -s /usr/bin/nodejs /usr/bin/node
COPY files/start.sh /root/
COPY files/env /share/devel/Gp/machine/.env
COPY files/projects.json /share/devel/Gp/machine/
RUN cd /opencl_runtime_16.1.1_x64_ubuntu_6.4.0.25/ && ./install.sh -s intel_opencl.conf
# apache configs
RUN cd /share/devel/Gp/gpocl && mkdir build && cd build && cmake ../ && make
#VOLUME /share
EXPOSE 5081
#ENTRYPOINT ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
#CMD ["/bin/bash"]
CMD ["/bin/bash", "/root/start.sh"]
