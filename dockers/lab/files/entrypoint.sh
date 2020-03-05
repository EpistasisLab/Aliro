#!/bin/bash
wget localhost:51678/v1/metadata -t 1 -qO- &> /dev/null

cd ${PROJECT_ROOT}/lab/webapp

source /etc/profile.d/tag.sh

echo "/================================\\"
echo "| Starting PennAI version ${TAG} |"
echo "| Build environment ${BUILD_ENV} |"
echo "\\===============================/"

# start the frontend
if [ ${WEBDEV} -eq 1 ]; then
    echo "Starting frontend in build-dev mode"
    npm run build-dev &
else
    echo "Starting frontend in build mode"
    npm run build
fi

# start the backend
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

#   TODO: split ai to a seperate docker container; should be dependent on lab, db, and machine.
#       For now, wait for the singular machine to be active, or wait a set amount of time in the case of 
#       machine scaling.

#    echo "waiting for machine to be responsive..."
#    /root/wait-for-it.sh -t 40 ${MACHINE_HOST}:${MACHINE_PORT} -- echo "machine wait over"

    echo "waiting set time to allow machines to start..."
    sleep 1
      

    echo "starting ai..."

    #: "${AI_RECOMMENDER:?Need to set environmental variable AI_RECOMMENDER to be non-empty}"
    [ -z "$AI_RECOMMENDER" ] && { echo "Need to set environmental variable AI_RECOMMENDER to be non-empty"; exit 1; }

    #PARMS="-n ${AI_NUMRECOMMEND}  -rec ${AI_RECOMMENDER} -term_condition ${AI_TERM_COND} -max_time ${AI_MAX_TIME}"
    PARMS="-rec ${AI_RECOMMENDER}"

    # optional parameters
    [ -n "$AI_VERBOSE" ] && { PARMS+=" -v"; }
    [ -n "$AI_PMLB_KNOWLEDGEBASE" ] && { PARMS+=" --knowledgebase"; }
    [ -n "$AI_NUMRECOMMEND" ] && { PARMS+=" -n ${AI_NUMRECOMMEND}"; }
    [ -n "$AI_TERM_COND" ] && { PARMS+=" -term_condition ${AI_TERM_COND}"; }
    [ -n "$AI_MAX_TIME" ] && { PARMS+=" -max_time ${AI_MAX_TIME}"; }


    echo "python -m ai.ai $PARMS"

    cd $PROJECT_ROOT/
    #python -m ai.ai $PARMS
    pm2 start "python -u -m ai.ai $PARMS" --name ai

else
    echo "not autostarting ai..."
fi


#final command
bash
