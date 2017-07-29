#!/bin/bash
cd ${IFROOT}/penn-ai
#results already in the db?
if [ -f "mongo_export.log" ]
then
        echo "$file found."
else
        python3 /opt/penn-ai/tests/export_to_mongo.py > $file
fi
if [ -f "rec_state.obj" ]
then
        rm -f rec_state.obj
fi
#start the ai
python3 -m ai.ai
bash
