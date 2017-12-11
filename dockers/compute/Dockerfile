#working off of an ubuntu wily rootfs
FROM pennai/base:latest
WORKDIR /opt/
#
ENV PATH /opt/conda/bin:$PATH
RUN pip install scikit-mdr
RUN pip install deap
RUN pip install requests_toolbelt
RUN pip install urllib3
RUN conda install scikit-learn pymongo tqdm
