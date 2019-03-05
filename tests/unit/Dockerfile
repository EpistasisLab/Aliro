FROM python:3

# Miniconda 4.5.4
RUN echo 'export PATH=/opt/conda/bin:$PATH' > /etc/profile.d/conda.sh && \
    wget --quiet https://repo.continuum.io/miniconda/Miniconda3-4.5.4-Linux-x86_64.sh -O ~/miniconda.sh && \
    /bin/bash ~/miniconda.sh -b -p /opt/conda && \
    rm ~/miniconda.sh

#nodejs
RUN  wget --quiet https://nodejs.org/dist/v6.12.3/node-v6.12.3-linux-x64.tar.xz -O ~/node.tar.xz && \
    tar -xvf ~/node.tar.xz -C /opt/ && \
    rm ~/node.tar.xz
ENV PATH /opt/node-v6.12.3-linux-x64/bin:$PATH

# set up conda environment
ENV PATH /opt/conda/bin:$PATH
RUN conda install --yes scikit-learn pymongo tqdm pandas matplotlib
RUN pip install mlxtend
RUN pip install stopit
RUN pip install pydot
RUN pip install simplejson
RUN pip install xgboost
RUN pip install sphinx
RUN pip install coverage
RUN pip install nose
RUN pip install nose-htmloutput
RUN pip install parameterized
RUN npm install -g mocha
# pypi packages for docs
RUN pip install m2r
RUN pip install sphinx_rtd_theme

### my surprise fork
RUN pip install numpy cython
RUN git clone https://github.com/lacava/surprise.git 
WORKDIR surprise
RUN python setup.py install

RUN apt-get update && apt-get install -y vim dos2unix graphviz
