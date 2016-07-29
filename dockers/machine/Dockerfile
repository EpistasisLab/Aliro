#working off of an ubuntu xenial rootfs
FROM scratch
ADD files/xenial.tgz /
RUN apt-get -y update && apt-get -y install git bc make dpkg-dev && mkdir -p /usr/src/kernels && mkdir -p /opt/nvidia/nvidia_installers

ADD http://developer.download.nvidia.com/compute/cuda/7.5/Prod/local_installers/cuda_7.5.18_linux.run /opt/nvidia

WORKDIR /usr/src/kernels
RUN git clone git://git.kernel.org/pub/scm/linux/kernel/git/stable/linux-stable.git linux
WORKDIR linux
RUN git checkout -b stable v`uname -r` && zcat /proc/config.gz > .config && make modules_prepare
RUN sed -i -e "s/`uname -r`+/`uname -r`/" include/generated/utsrelease.h # In case a '+' was added

# Nvidia drivers setup
WORKDIR /opt/nvidia/
RUN chmod +x cuda_7.5.18_linux.run && ./cuda_7.5.18_linux.run -extract=`pwd`/nvidia_installers
WORKDIR /opt/nvidia/nvidia_installers

RUN ./NVIDIA-Linux-x86_64-352.39.run -a -x --ui=none
RUN sed -i "s/read_cr4/__read_cr4/g" NVIDIA-Linux-x86_64-352.39/kernel/nv-pat.c
RUN sed -i "s/write_cr4/__write_cr4/g" NVIDIA-Linux-x86_64-352.39/kernel/nv-pat.c
CMD ./NVIDIA-Linux-x86_64-352.39/nvidia-installer -q -a -n -s --kernel-source-path=/usr/src/kernels/linux/ && insmod /opt/nvidia/nvidia_installers/NVIDIA-Linux-x86_64-352.39/kernel/uvm/nvidia-uvm.ko

