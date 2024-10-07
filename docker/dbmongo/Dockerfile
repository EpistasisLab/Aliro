# Stage 1: Build stage with all necessary files
FROM mongo:5.0.29 AS builder

WORKDIR /opt/

ARG docker_filepath=docker/dbmongo/files

# Copy necessary files
COPY ${docker_filepath}/mongod.conf /etc/
COPY ${docker_filepath}/users.json /root/
COPY ${docker_filepath}/projects.json /root/
COPY ${docker_filepath}/entrypoint.sh /root/
COPY ${docker_filepath}/sync.sh /root/

# Convert line endings for DOS/Windows compatibility
RUN apt-get update && apt-get install -y dos2unix && \
    dos2unix /root/entrypoint.sh /root/sync.sh /root/users.json /root/projects.json && \
    dos2unix /etc/mongod.conf && \
    apt-get remove -y dos2unix && \
    apt-get autoremove -y && \
    apt-get clean

# Stage 2: Final runtime image
FROM mongo:5.0.29

# Copy required configurations and scripts from the builder stage
COPY --from=builder /etc/mongod.conf /etc/
COPY --from=builder /root/entrypoint.sh /root/
COPY --from=builder /root/sync.sh /root/
COPY --from=builder /root/users.json /root/
COPY --from=builder /root/projects.json /root/

EXPOSE 27017

CMD ["/bin/bash", "/root/entrypoint.sh"]

