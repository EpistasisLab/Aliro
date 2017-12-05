#working off of an ubuntu wily rootfs
FROM pennai/compute:latest
VOLUME /share
COPY files/start.sh /root/
COPY files/entrypoint.sh /root/
CMD ["/bin/bash", "/root/start.sh"]
