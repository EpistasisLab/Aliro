#!/bin/bash
wget localhost:51678/v1/metadata -t 1 -qO- &> /dev/null


cd ${PROJECT_ROOT}/lab

if [ -d 'node_modules' ]; then
    echo "npm ready"
else
    echo "unzipping npm dependencies"
    tar -zxf /root/node_modules.tar.gz node_modules --checkpoint=100 --checkpoint-action="echo=Hit %s checkpoint #%u"
    echo "unzipping complete"
    echo "npm install"
    npm install
    echo "npm install complete"
fi

if [ ! -d "../tmp" ]; then
    mkdir ../tmp
fi

npm run build
pm2 start lab.config.js --watch

#start pennai
if [ ${AI_AUTOSTART} -eq 1 ]; then
    echo "autostarting ai..."

    echo "waiting for lab to be responsive..."
    /root/wait-for-it.sh -t 200 lab:5080 

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