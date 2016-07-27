FROM scratch
add files/rootfs.tgz /
#RUN echo "deb http://httpredir.debian.org/debian jessie-backports main contrib non-free" >> /etc/apt/sources.list
RUN apt-get update && apt-get install -q -y \
    wget \
    build-essential \
    cmake \
    vim \
    nvidia-libopencl1 nvidia-opencl-common   nvidia-opencl-dev nvidia-opencl-icd opencl-headers \
    cpio
