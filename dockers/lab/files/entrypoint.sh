#!/bin/bash
wget localhost:51678/v1/metadata -t 1 -qO- &> /dev/null


## cd ${PROJECT_ROOT}/lab
## if [ -d 'node_modules' ]; then
##     echo "/lab npm ready"
## else
##     echo "/lab installing npm dependencies"
##     npm install
##     echo "/lab install complete"
## fi
## 
## cd ${PROJECT_ROOT}/lab/webapp
## if [ -d 'node_modules' ]; then
##     echo "/lab/webapp npm ready"
## else
##     echo "/lab/webapp installing npm dependencies"
##     npm install
##     echo "/lab/webapp install complete"
## fi

cd ${PROJECT_ROOT}/lab/webapp
npm run build

cd ${PROJECT_ROOT}/lab
pm2 start lab.config.js --watch

#start pennai
if [ ${AI_AUTOSTART} -eq 1 ]; then
    echo "autostarting ai..."

    echo "waiting for lab to be responsive..."
    /root/wait-for-it.sh -t 300 ${LAB_HOST}:${LAB_PORT} -- echo "lab wait over"

    echo "waiting for machine to be responsive..."
    /root/wait-for-it.sh -t 40 ${MACHINE_HOST}:${MACHINE_PORT} -- echo "machine wait over"

    echo "sleep..."
    sleep 30s
    echo "starting ai..."
    echo 'python -m ai.ai -v -n ' ${AI_NUMRECOMMEND} ' -rec ' ${AI_RECOMMENDER}

    cd $PROJECT_ROOT/
    python -m ai.ai -v -n ${AI_NUMRECOMMEND} -rec ${AI_RECOMMENDER}
    #python -m ai.ai -n 2
    #pm2 start python -- -m ai.ai -n 2
else
    echo "not autostarting ai..."
fi


#final command
## bash
pm2 logs
