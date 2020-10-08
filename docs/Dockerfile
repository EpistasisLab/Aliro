FROM python:3.7.4-stretch

COPY /docs/requirements.txt /
COPY /tests/unit/files/requirements.txt src_requirements.txt

RUN pip install -r /requirements.txt
RUN pip install -r /src_requirements.txt