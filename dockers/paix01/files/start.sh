#!/bin/bash
cd ${IFROOT}/penn-ai
#results already in the db?
#python3 tests/export_to_mongo.py >> mongo_export.log
python3 tests/export_to_mongo.py
#start the ai
#while true;do python3 -m ai.ai;sleep 5;done
bash
