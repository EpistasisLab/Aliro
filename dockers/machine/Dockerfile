#working off of an ubuntu wily rootfs
FROM pennai/compute:latest
WORKDIR /opt/
COPY files/env pennai/machine/.env
#COPY files/projects.json pennai/machine/
COPY files/start.sh /root/
COPY files/entrypoint.sh /root/
COPY files/get_datasets.sh /root/
RUN cd pennai/ && mkdir tmp && cd machine && npm install && npm -g install pm2
VOLUME /share
EXPOSE 5081
#need ssh?
#RUN echo "root:training" | chpasswd
#RUN sed -i 's/prohibit-password/yes/' /etc/ssh/sshd_config
#RUN chown -R root:root /root/.ssh;chmod -R 700 /root/.ssh
#RUN echo "StrictHostKeyChecking=no" >> /etc/ssh/ssh_config
#RUN mkdir /var/run/sshd
CMD ["/bin/bash", "/root/start.sh"]
