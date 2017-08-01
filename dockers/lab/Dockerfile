#working off of an ubuntu wily rootfs
FROM scratch
ADD files/rootfs.tgz /
WORKDIR /opt
#ssh key is set to the deploy key for this app in gitlab
ADD files/ssh.tgz /
RUN apt-get update && apt-get install -y vim  git openssh-client htop net-tools iputils-ping xz-utils wget ca-cacert --no-install-recommends
#check if we need to rebuild
ADD files/version /tmp
#add Gp sourcecode || not needed if mounting /share
RUN git clone git@github.com:EpistasisLab/Gp.git 
RUN  wget --quiet https://nodejs.org/dist/v6.11.0/node-v6.11.0-linux-x64.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /opt/ && \
    rm ~/node.tar.xz

ENV PATH /opt/node-v6.11.0-linux-x64/bin:$PATH
RUN cd Gp/lab && npm install && npm install -g bower pm2 webpack webpack-dev-server  && bower install --allow-root
COPY files/start.sh /root/
COPY files/env /opt/.env
EXPOSE 5080
CMD ["/bin/bash", "/root/start.sh"]
