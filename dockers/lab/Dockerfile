#working off of an ubuntu wily rootfs
FROM scratch
ADD files/rootfs.tgz /
WORKDIR = /opt
#ssh key is set to the deploy key for this app in gitlab
ADD files/ssh.tgz /
RUN apt-get update && apt-get install -y vim  npm git openssh-client htop net-tools iputils-ping --no-install-recommends
#check if we need to rebuild
ADD files/version /tmp
#add Gp sourcecode || not needed if mounting /share
RUN git clone -b aws git@github.com:EpistasisLab/Gp.git 
#install bower globally, needs "nodejs" available as "node"
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN cd Gp/lab && npm install && npm install -g bower pm2 webpack webpack-dev-server  && bower install --allow-root && webpack
# mongo configs
COPY files/start.sh /root/
EXPOSE 5080
CMD ["/bin/bash", "/root/start.sh"]
