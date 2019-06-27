FROM python:3

RUN apt-get update --fix-missing \
    && apt-get install -y --no-install-recommends \
    graphviz dos2unix && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Miniconda 4.5.4
RUN echo 'export PATH=/opt/conda/bin:$PATH' > /etc/profile.d/conda.sh && \
    wget --quiet https://repo.continuum.io/miniconda/Miniconda3-4.6.14-Linux-x86_64.sh -O ~/miniconda.sh && \
    /bin/bash ~/miniconda.sh -b -p /opt/conda && \
    rm ~/miniconda.sh

# set up conda environment
ENV PATH /opt/conda/bin:$PATH

# set conda config for faster build
RUN conda config --set channel_priority strict

# set up conda environment, specify node version because of known issue with version 11.11
# check here - https://github.com/facebook/jest/issues/8069
RUN conda install -y -c conda-forge nodejs scikit-learn=0.20.2 \
    pymongo tqdm pandas matplotlib \
    xgboost simplejson numpy cython && \
    conda clean --all -y

### my surprise fork
RUN pip install --no-cache-dir git+https://github.com/lacava/surprise.git@master


RUN pip install --no-cache-dir mlxtend \
    pydot sphinx coverage \
    nose nose-htmloutput parameterized \
    m2r sphinx_rtd_theme

RUN npm install -g mocha

# install lab/webapp/node_modules to an anon volume
WORKDIR /appsrc/lab/webapp
COPY lab/webapp/package.json /appsrc/lab/webapp/
RUN dos2unix /appsrc/lab/webapp/package.json
RUN npm install --silent --progress=false
