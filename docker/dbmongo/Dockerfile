# Stage 1: Build stage with all necessary files
FROM mongo:4.4.18 AS builder

WORKDIR /opt/

ARG docker_filepath=docker/dbmongo/files

# Copy necessary files
COPY ${docker_filepath}/mongod.conf /etc/
COPY ${docker_filepath}/users.json /root/
COPY ${docker_filepath}/projects.json /root/
COPY ${docker_filepath}/entrypoint.sh /root/
COPY ${docker_filepath}/sync.sh /root/

# Remove old MongoDB repository and install new one
RUN rm -f /etc/apt/sources.list.d/mongodb*.list && \
    apt-get update && \
    apt-get install -y gnupg curl && \
    curl -fsSL https://www.mongodb.org/static/pgp/server-6.0.asc | gpg --dearmor -o /usr/share/keyrings/mongodb-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/mongodb-archive-keyring.gpg] http://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list && \
    apt-get update

# Convert line endings for DOS/Windows compatibility
RUN apt-get install -y dos2unix && \
    dos2unix /root/entrypoint.sh /root/sync.sh /root/users.json /root/projects.json && \
    dos2unix /etc/mongod.conf && \
    apt-get remove -y dos2unix && \
    apt-get autoremove -y && \
    apt-get clean

# Stage 2: Final runtime image
FROM mongo:4.4.18

# Copy required configurations and scripts from the builder stage
COPY --from=builder /etc/mongod.conf /etc/
COPY --from=builder /root/entrypoint.sh /root/
COPY --from=builder /root/sync.sh /root/
COPY --from=builder /root/users.json /root/
COPY --from=builder /root/projects.json /root/

EXPOSE 27017

CMD ["/bin/bash", "/root/entrypoint.sh"]

