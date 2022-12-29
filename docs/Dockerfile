FROM python:3.7.16-buster

ARG USE_WHEELS
ARG wheel_directory=docker/wheels

COPY /docs/requirements.txt /
RUN pip install -r /requirements.txt

RUN mkdir /root/wheel
COPY ${wheel_directory}/*.whl /root/wheel/

COPY /docker/lab/files/requirements.txt /root/lab_requirements.txt
RUN if [ ${USE_WHEELS} -eq 1 ] ; then pip install --no-index --find-links=/root/wheel -r /root/lab_requirements.txt ; else pip install --no-cache-dir -r /root/lab_requirements.txt ; fi

# moved surprise inside /docker/lab/files/requirements.txt
# COPY /docker/lab/files/requirements-surprise-${ARCH}.txt /root/lab_surprise_requirements.txt
# RUN pip install --no-cache-dir -r /root/lab_surprise_requirements.txt

COPY /docker/machine/files/requirements.txt /root/mach_requirements.txt
RUN pip install --no-cache-dir -r /root/mach_requirements.txt
RUN if [ ${USE_WHEELS} -eq 1 ] ; then pip install --no-index --find-links=/root/wheel -r /root/mach_requirements.txt ; else pip install --no-cache-dir -r /root/mach_requirements.txt ; fi

RUN rm /root/wheel/*.whl

# COPY /docker/machine/files/requirements_shap.txt /root/mach_requirements_shap.txt
# RUN pip install --no-cache-dir -r /root/mach_requirements_shap.txt
