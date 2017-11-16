#starting from the pennai base image (ubuntu wily, utils, certs)
FROM pennai/base:latest
WORKDIR /opt
ADD files/version /tmp
#clone the project
RUN git clone git@github.com:EpistasisLab/Gp.git 
#get the lab app ready
RUN cd Gp/lab && npm install && npm install -g bower pm2 webpack webpack-dev-server 
#
COPY files/start.sh /root/
COPY files/env /opt/.env
EXPOSE 22
EXPOSE 5080
CMD ["/bin/bash", "/root/start.sh"]
