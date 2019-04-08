FROM pennai/base:latest

ARG docker_filepath=dockers/machine/files

# install node_modules to an anon volume
WORKDIR /appsrc/machine

COPY machine/package.json /appsrc/machine/
RUN dos2unix /appsrc/machine/package.json
RUN npm install --silent --progress=false

COPY ${docker_filepath}/entrypoint.sh /root/
COPY ${docker_filepath}/wait-for-it.sh /root/
RUN dos2unix /root/wait-for-it.sh && dos2unix /root/entrypoint.sh
RUN ["chmod", "+x", "/root/wait-for-it.sh"]
RUN apt-get update --fix-missing \
    && apt-get install -y graphviz \
    --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

## install dependencies for machine
RUN pip install --no-cache-dir mlxtend pydot

CMD ["/bin/bash", "/root/entrypoint.sh"]
