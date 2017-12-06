#working off of an ubuntu wily rootfs
FROM pennai/base:latest
WORKDIR /opt/
#ADD files/intel_opencl.tgz /
#ADD files/intel_opencl.conf /opencl_runtime_16.1.1_x64_ubuntu_6.4.0.25/
#
ENV PATH /opt/conda/bin:$PATH
RUN pip install scikit-mdr
RUN pip install deap
RUN pip install requests_toolbelt
RUN pip install urllib3
RUN conda install scikit-learn pymongo tqdm
#RUN cd /opencl_runtime_16.1.1_x64_ubuntu_6.4.0.25/ && ./install.sh -s intel_opencl.conf
