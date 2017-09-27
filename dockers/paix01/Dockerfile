#working off of an ubuntu wily rootfs
FROM pennai/compute:latest
ADD files/version /tmp
RUN git clone -b realnewmake git@github.com:EpistasisLab/penn-ai.git
VOLUME /share
EXPOSE 5081
COPY files/start.sh /root/
CMD ["/bin/bash", "/root/start.sh"]
