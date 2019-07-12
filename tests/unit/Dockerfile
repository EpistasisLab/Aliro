FROM python:3

#nodejs
RUN wget --quiet https://nodejs.org/dist/v11.14.0/node-v11.14.0-linux-x64.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /opt/ && \
    rm ~/node.tar.xz
ENV PATH /opt/node-v11.14.0-linux-x64/bin:$PATH

RUN apt-get update --fix-missing \
    && apt-get install -y --no-install-recommends \
    graphviz dos2unix && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

COPY /tests/unit/files/requirements.txt /root/
RUN pip install --no-cache-dir -r /root/requirements.txt

### Bill's surprise fork
RUN pip install --no-cache-dir git+https://github.com/lacava/surprise.git@master

RUN npm install -g mocha

# install lab/webapp/node_modules to an anon volume

COPY lab/webapp/package.json /appsrc/lab/webapp/
RUN dos2unix /appsrc/lab/webapp/package.json
RUN npm install --silent --progress=false
