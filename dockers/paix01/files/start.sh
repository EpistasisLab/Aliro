#!/bin/bash
cd ${IFROOT}/penn-ai
file=mongo_export.log
#results already in the db?
if [ -f "$file" ]
then
        echo "$file found."
else
        python3 /opt/penn-ai/tests/export_to_mongo.py > $file
fi
#start the ai
python3 -m ai.ai
bash
