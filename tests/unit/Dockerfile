FROM python:3.7.11-stretch

#nodejs
RUN wget --quiet https://nodejs.org/dist/v12.22.9/node-v12.22.9-linux-x64.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /opt/ && \
    rm ~/node.tar.xz
ENV PATH /opt/node-v12.22.9-linux-x64/bin:$PATH

RUN apt-get update --fix-missing \
    && apt-get install -y --no-install-recommends \
    graphviz dos2unix && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN npm install -g mocha

RUN pip install --upgrade pip

## tests
COPY /tests/unit/requirements.txt /root/test_requirements.txt
RUN pip install --no-cache-dir -r /root/test_requirements.txt

## machine and lab container
COPY /docker/lab/files/requirements.txt /root/lab_requirements.txt
RUN pip install --no-cache-dir -r /root/lab_requirements.txt

COPY /docker/machine/files/requirements.txt /root/mach_requirements.txt
RUN pip install --no-cache-dir -r /root/mach_requirements.txt
COPY /docker/machine/files/requirements_shap.txt /root/mach_requirements_shap.txt
RUN pip install --no-cache-dir -r /root/mach_requirements_shap.txt

# install lab/node_modules to an anon volume
WORKDIR /appsrc/lab
COPY lab/package.json /appsrc/lab/
RUN dos2unix /appsrc/lab/package.json
RUN npm install --silent --progress=false

# install lab/webapp/node_modules to an anon volume
WORKDIR /appsrc/lab/webapp
COPY lab/webapp/package.json /appsrc/lab/webapp/
RUN dos2unix /appsrc/lab/webapp/package.json
RUN npm install --silent --progress=false
