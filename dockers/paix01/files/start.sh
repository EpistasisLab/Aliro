#!/bin/bash
cd ${IFROOT}/penn-ai
#results already in the db?
if [ -f "mongo_export.log" ]
then
        echo "mongo_export.log found."
else
        python3 tests/export_to_mongo.py > mongo_export.log
fi
#start the ai
while true;do python3 -m ai.ai;sleep 5;done
bash
