#working off of an ubuntu wily rootfs
FROM scratch
ADD files/xenial.tgz /
#ssh key is set to the deploy key for this app in gitlab
ADD files/ssh.tgz /
#add repo for mongodb
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv BC711F9BA15703C6
RUN echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
RUN apt-get update && apt-get install -y --allow-unauthenticated vim mongodb-org  npm git openssh-client htop net-tools iputils-ping --no-install-recommends
#check if we need to rebuild
ADD files/version /tmp
#add Gp sourcecode || not needed if mounting /share
#RUN mkdir share && mkdir /share/devel && cd /share/devel && git clone git@github.com:EpistasisLab/Gp.git 
RUN mkdir share && mkdir /share/devel && cd /share/devel && git clone git@sarlacc.pmacs.upenn.edu:svitale/Gp.git
#install bower globally, needs "node" available as "node"
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN cd /share/devel/Gp/lab && npm install 
RUN cd /share/devel/Gp/lab && npm install -g bower pm2 webpack webpack-dev-server
RUN cd /share/devel/Gp/lab && bower install --allow-root
RUN cd /share/devel/Gp/lab && webpack
# mongo configs
ADD files/mongodump.tgz /
COPY files/.mongo* /root/
COPY files/mongod.conf /etc/
RUN echo "starting up";
COPY files/start.sh /root/
EXPOSE 5080
CMD ["/bin/bash", "/root/start.sh"]
