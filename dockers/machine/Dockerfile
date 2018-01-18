FROM pennai/compute:latest
WORKDIR /opt/
COPY files/env pennai/machine/.env
RUN cd pennai/ && mkdir tmp && cd machine && npm install && npm -g install pm2

VOLUME /share
EXPOSE 5081
COPY files/entrypoint.sh /root/
COPY files/start.sh /root/
RUN dos2unix /root/start.sh
RUN dos2unix /root/entrypoint.sh
CMD ["/bin/bash", "/root/start.sh"]
