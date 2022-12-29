#!/usr/bin/bash

docker system prune -a -f --volumes
docker-compose -f ./docker-compose-unit-test.yml build -m 8g
# git lfs fetch --all
# git lfs pull
docker run -v $(pwd):/appsrc -w /appsrc aliro-unit_tester coverage run -m nose -s -v ai/tests/test_sklearn_api.py
