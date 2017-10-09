#working off of an ubuntu wily rootfs
FROM pennai/compute:latest
WORKDIR /opt/
ADD files/version /tmp
RUN git clone git@github.com:EpistasisLab/Gp.git
RUN cd Gp/machine && npm install && npm -g install pm2
#extract pmlb test datasets
COPY files/env Gp/machine/.env
COPY files/start.sh /root/
COPY files/get_datasets.sh /root/
COPY files/projects.json Gp/machine/
EXPOSE 5081
CMD ["/bin/bash", "/root/start.sh"]
