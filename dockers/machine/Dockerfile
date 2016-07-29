#working off of an ubuntu wily rootfs
FROM scratch
ADD files/xenial.tgz /
RUN apt-get update && apt-get install -q -y \
    wget \
    build-essential \
    cmake \
    vim \
#    nvidia-libopencl1 nvidia-opencl-common   nvidia-opencl-dev nvidia-opencl-icd opencl-headers \
    cpio
#ssh key is set to the deploy key for this app in gitlab
ADD files/ssh.tgz /
#some sample data for mongo
RUN mkdir share && mkdir /share/devel && cd /share/devel && git clone git@devel.ceet.upenn.edu:IBI/Gp.git
#RUN cd /share/devel/Gp/machine && npm install
COPY files/start.sh /root/
COPY files/env /share/devel/Gp/machine/.env
#VOLUME /share
EXPOSE 5081
CMD ["/bin/bash"]
#CMD ["/bin/bash", "/root/start.sh"]
