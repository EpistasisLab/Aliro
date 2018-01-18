FROM pennai/compute:latest
VOLUME /share
COPY files/entrypoint.sh /root/
RUN dos2unix /root/entrypoint.sh
CMD ["/bin/bash", "/root/entrypoint.sh"]
