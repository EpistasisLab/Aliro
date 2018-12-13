FROM node:8.11.2-slim

# Miniconda 4.5.4
RUN echo 'export PATH=/opt/conda/bin:$PATH' > /etc/profile.d/conda.sh && \
    wget --quiet https://repo.continuum.io/miniconda/Miniconda3-4.5.4-Linux-x86_64.sh -O ~/miniconda.sh && \
    /bin/bash ~/miniconda.sh -b -p /opt/conda && \
    rm ~/miniconda.sh

# set up conda environment
ENV PATH /opt/conda/bin:$PATH
RUN conda install --yes scikit-learn pymongo tqdm pandas matplotlib
RUN pip install eli5
RUN pip install simplejson
RUN pip install xgboost
RUN pip install sphinx
RUN pip install coverage
RUN pip install nose
RUN pip install nose-htmloutput
RUN pip install parameterized
RUN npm install -g mocha


RUN apt-get update && apt-get install -y vim dos2unix
