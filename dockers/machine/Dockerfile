#working off of an ubuntu wily rootfs
FROM pennai/compute:latest
WORKDIR /opt/
ADD files/version /tmp
RUN git clone git@github.com:EpistasisLab/Gp.git
RUN cd Gp/machine && npm install && npm -g install pm2
VOLUME /share
#extract pmlb test datasets
RUN  wget --quiet https://s3.us-east-2.amazonaws.com/pennai-docker-files/pmlb.tgz -O ~/pmlb.tgz && \
    tar -xzvf ~/pmlb.tgz -C Gp/machine/datasets/byuser && \
    rm ~/pmlb.tgz
COPY files/env Gp/machine/.env
COPY files/start.sh /root/
COPY files/projects.json Gp/machine/
EXPOSE 5081
CMD ["/bin/bash", "/root/start.sh"]
