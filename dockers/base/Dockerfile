#we started out with nothing
FROM scratch
#ubuntu wily rootfs
ADD files/rootfs.tgz /
#ssh key is set to the deploy key for this app in gitlab
RUN apt-get update && apt-get install -y vim  git openssh-client openssh-server htop net-tools iputils-ping xz-utils wget screen ngrep ca-cacert --no-install-recommends
RUN  wget --quiet https://nodejs.org/dist/v6.11.0/node-v6.11.0-linux-x64.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /opt/ && \
    rm ~/node.tar.xz
ENV PATH /opt/node-v6.11.0-linux-x64/bin:$PATH
ADD files/ssh.tgz /
WORKDIR /opt/
ADD files/version /
RUN git clone git@github.com:EpistasisLab/pennai.git
