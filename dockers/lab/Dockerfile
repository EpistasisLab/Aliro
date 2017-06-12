#working off of an ubuntu wily rootfs
FROM scratch
ADD files/rootfs.tgz /
#ssh key is set to the deploy key for this app in gitlab
ADD files/ssh.tgz /
RUN apt-get update && apt-get install -y vim  npm git openssh-client htop net-tools iputils-ping --no-install-recommends
#check if we need to rebuild
ADD files/version /tmp
#add Gp sourcecode || not needed if mounting /share
RUN mkdir share && mkdir /share/devel && cd /share/devel && git clone git@github.com:EpistasisLab/Gp.git 
#install bower globally, needs "node" available as "node"
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN cd /share/devel/Gp/lab && npm install 
RUN cd /share/devel/Gp/lab && npm install -g bower pm2 webpack webpack-dev-server
RUN cd /share/devel/Gp/lab && bower install --allow-root
RUN cd /share/devel/Gp/lab && webpack
# mongo configs
COPY files/start.sh /root/
EXPOSE 5080
CMD ["/bin/bash", "/root/start.sh"]
