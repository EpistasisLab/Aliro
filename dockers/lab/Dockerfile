#starting from the pennai base image (ubuntu wily, utils, certs)
FROM pennai/base:latest
RUN cd pennai/lab && npm install && npm install -g bower pm2 webpack webpack-dev-server  && bower install --allow-root
#
COPY files/entrypoint.sh /root/

COPY files/env /opt/.env
#EXPOSE 22
EXPOSE 5080
CMD ["/bin/bash", "/root/entrypoint.sh"]
