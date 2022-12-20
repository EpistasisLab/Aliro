FROM python:3.7.16-buster

ARG ARCH
ARG wheel_directory=docker/pywheels

#nodejs
RUN ARCH= && dpkgArch="$(dpkg --print-architecture)" \
    && case "${dpkgArch##*-}" in \
      amd64) ARCH='x64';; \
      ppc64el) ARCH='ppc64le';; \
      s390x) ARCH='s390x';; \
      arm64) ARCH='arm64';; \
      armhf) ARCH='armv7l';; \
      i386) ARCH='x86';; \
      *) echo "unsupported architecture"; exit 1 ;; \
    esac \
    && wget --quiet https://nodejs.org/dist/v12.22.9/node-v12.22.9-linux-$ARCH.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /usr/local/ --strip-components=1 --no-same-owner && \
    rm ~/node.tar.xz && \
    ln -s /usr/local/bin/node /usr/local/bin/nodejs

# RUN wget --quiet https://nodejs.org/dist/v12.22.9/node-v12.22.9-linux-x64.tar.xz -O ~/node.tar.xz && \
#     tar -xvf ~/node.tar.xz -C /opt/ && \
#     rm ~/node.tar.xz
# ENV PATH /opt/node-v12.22.9-linux-x64/bin:$PATH

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
COPY ${wheel_directory}/*.whl /root/wheel/
COPY /docker/lab/files/requirements.txt /root/lab_requirements.txt
RUN pip install --no-cache-dir --find-links=/root/wheel -r /root/lab_requirements.txt
COPY /docker/lab/files/requirements-surprise-${ARCH}.txt /root/surprise_requirements.txt
RUN pip install --no-cache-dir --find-links=/root/wheel -r /root/surprise_requirements.txt

COPY /docker/machine/files/requirements.txt /root/mach_requirements.txt
RUN pip install --no-cache-dir --find-links=/root/wheel -r /root/mach_requirements.txt
# COPY /docker/machine/files/requirements_shap.txt /root/mach_requirements_shap.txt
# RUN pip install --no-cache-dir -r /root/mach_requirements_shap.txt
RUN rm -rf /root/wheel

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
