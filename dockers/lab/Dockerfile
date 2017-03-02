#working off of an ubuntu wily rootfs
FROM scratch
ADD files/xenial.tgz /
#ssh key is set to the deploy key for this app in gitlab
ADD files/ssh.tgz /
#some sample data for mongo
#update the default apt repo to include universe 
#RUN echo "deb http://archive.ubuntu.com/ubuntu/ xenial universe" >> /etc/apt/sources.list
#add repo for mongodb
RUN apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv BC711F9BA15703C6
RUN echo "deb http://repo.mongodb.org/apt/ubuntu xenial/mongodb-org/3.2 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-3.2.list
RUN apt-get update && apt-get install -y --allow-unauthenticated vim mongodb-org npm git openssh-client htop net-tools iputils-ping --no-install-recommends
#load sample data into mongo database
#RUN /etc/init.d/mongod start && mongorestore  /dump
ADD files/version /tmp
#add Gp sourcecode || not needed if mounting /share
RUN mkdir share && mkdir /share/devel && cd /share/devel && git clone --branch pennai git@sarlacc.pmacs.upenn.edu:svitale/Gp.git 
RUN cd /share/devel/Gp/lab && npm install 
#install bower globally, needs "node" available as "node"
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN cd /share/devel/Gp/lab && npm install -g bower pm2 webpack
RUN cd /share/devel/Gp/lab && bower install --allow-root
RUN cd /share/devel/Gp/lab webpack
# global install forever utility
# mongo configs
ADD files/mongodump.tgz /
COPY files/.mongo* /root/
COPY files/mongod.conf /etc/
#RUN mongod -f /etc/mongod.conf  & mongorestore  /dump
#COPY files/ca.crt /share/devel/bobber/config/ca.crt
COPY files/start.sh /root/
#COPY files/env /share/devel/Gp/lab/.env
# apache configs
#VOLUME /share
EXPOSE 5080
#ENTRYPOINT ["/usr/sbin/apache2ctl", "-D", "FOREGROUND"]
#CMD ["/bin/bash"]
CMD ["/bin/bash", "/root/start.sh"]
