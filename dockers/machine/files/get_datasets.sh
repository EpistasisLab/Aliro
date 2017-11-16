cd /opt
wget --quiet https://s3.us-east-2.amazonaws.com/pennai-docker-files/pmlb.tgz -O ~/pmlb.tgz && \
tar -xzvf ~/pmlb.tgz -C Gp/machine/datasets/byuser && \
rm ~/pmlb.tgz

