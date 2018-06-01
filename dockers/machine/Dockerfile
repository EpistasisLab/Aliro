FROM pennai/base:latest

WORKDIR /opt/
# TODO - instead of cloning the project, either copy or clone only what is needed
RUN git clone git@github.com:EpistasisLab/pennai.git

COPY files/env pennai/machine/.env
RUN cd pennai/ && mkdir tmp && cd machine && npm install && npm -g install pm2


COPY files/entrypoint.sh /root/
COPY files/start.sh /root/
RUN dos2unix /root/start.sh
RUN dos2unix /root/entrypoint.sh

VOLUME /share
EXPOSE 5081

CMD ["/bin/bash", "/root/start.sh"]