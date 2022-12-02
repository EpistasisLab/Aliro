FROM python:3.7.11-stretch

COPY /docs/requirements.txt /
RUN pip install -r /requirements.txt

COPY /docker/lab/files/requirements.txt /root/lab_requirements.txt
RUN pip install --no-cache-dir -r /root/lab_requirements.txt

COPY /docker/machine/files/requirements.txt /root/mach_requirements.txt
RUN pip install --no-cache-dir -r /root/mach_requirements.txt

COPY /docker/machine/files/requirements_shap.txt /root/mach_requirements_shap.txt
RUN pip install --no-cache-dir -r /root/mach_requirements_shap.txt
