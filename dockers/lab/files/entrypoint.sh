#!/bin/bash
wget localhost:51678/v1/metadata -t 1 -qO- &> /dev/null

cd ${PROJECT_ROOT}/lab/webapp
npm run build

cd ${PROJECT_ROOT}/lab
pm2 start lab.config.js --watch
pm2 logs &

echo "waiting for lab to be responsive..."
/root/wait-for-it.sh -t 300 ${LAB_HOST}:${LAB_PORT} -- echo "lab wait over"

echo "loading initial datasets..."
python  ./pyutils/loadInitialDatasets.py
echo "datasets loaded..."

#start pennai
if [ ${AI_AUTOSTART} -eq 1 ]; then
    echo "autostarting ai..."

    echo "waiting for machine to be responsive..."
    /root/wait-for-it.sh -t 40 ${MACHINE_HOST}:${MACHINE_PORT} -- echo "machine wait over"

    echo "starting ai..."

    PARMS="-n ${AI_NUMRECOMMEND}  -rec ${AI_RECOMMENDER}"
    if [ ${AI_VERBOSE} -eq 1 ]; then
        PARMS+=" -v"
    fi
    if [ ${AI_PMLB_KNOWLEDGEBASE} -eq 1 ]; then
        PARMS+=" --knowledgebase"
    fi

    echo "python -m ai.ai $PARMS"

    cd $PROJECT_ROOT/
    #python -m ai.ai $PARMS
    pm2 start "python -u -m ai.ai $PARMS" --name ai

else
    echo "not autostarting ai..."
fi


#final command
bash
