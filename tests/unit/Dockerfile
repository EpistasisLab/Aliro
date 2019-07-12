FROM python:3

#nodejs
RUN  wget --quiet https://nodejs.org/dist/v11.14.0/node-v11.14.0-linux-x64.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /opt/ && \
    rm ~/node.tar.xz
ENV PATH /opt/node-v11.14.0-linux-x64/bin:$PATH

RUN apt-get update --fix-missing \
    && apt-get install -y --no-install-recommends \
    graphviz dos2unix && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --no-cache-dir \
    scikit-learn==0.20.2 \
    tqdm==4.32.2 \
    pymongo==3.8.0 \
    pandas==0.24.2 \
    matplotlib==3.1.1 \
    cython==0.29.2 \
    xgboost==0.82 \
    simplejson==3.16.0 \
    mlxtend==0.16.0 \
    pydot==1.4.1 \
    sphinx==2.1.2 \
    coverage==4.5.3 \
    nose==1.3.7 \
    nose-htmloutput==0.6.0 \
    parameterized==0.7.0 \
    m2r==0.2.1 \
    sphinx-rtd-theme==0.4.3

### Bill's surprise fork
RUN pip install --no-cache-dir git+https://github.com/lacava/surprise.git@master


RUN npm install -g mocha

# install lab/webapp/node_modules to an anon volume
WORKDIR /appsrc/lab/webapp
COPY lab/webapp/package.json /appsrc/lab/webapp/
RUN dos2unix /appsrc/lab/webapp/package.json
RUN npm install --silent --progress=false
