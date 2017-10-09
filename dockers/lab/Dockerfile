#starting from the pennai base image (ubuntu wily, utils, certs)
FROM pennai/base:latest
WORKDIR /opt
ADD files/version /tmp
#clone the project
RUN git clone git@github.com:EpistasisLab/Gp.git 
#we use only the purist node
#RUN  wget --quiet https://nodejs.org/dist/v6.11.0/node-v6.11.0-linux-x64.tar.xz -O ~/node.tar.xz && \
#    tar -xvf ~/node.tar.xz -C /opt/ && \
#    rm ~/node.tar.xz
#ENV PATH /opt/node-v6.11.0-linux-x64/bin:$PATH
#get the lab app ready
RUN cd Gp/lab && npm install && npm install -g bower pm2 webpack webpack-dev-server  && bower install --allow-root
#
COPY files/start.sh /root/
COPY files/env /opt/.env
EXPOSE 22
EXPOSE 5080
CMD ["/bin/bash", "/root/start.sh"]
