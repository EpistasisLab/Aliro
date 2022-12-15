#!/usr/bin/bash

docker system prune -a -f --volumes
docker-compose -f docker-compose-int-test.yml up --abort-on-container-exit -V
