#!/bin/bash
wget localhost:51678/v1/metadata -t 1 -qO- &> /dev/null


cd ${PROJECT_ROOT}/lab

# unzip /root/node_modules.tar.gz if the node_modules directory does not exist or if the file has changed
if [ -d 'node_modules' ]; then
    sha1sum -c node_modules_entrypoint_check.sha1
    if [ $? == 0 ]; then
        echo "npm ready"
    else
        ## install is faster because it is only getting the diffs, but requires net access
        echo "/root/node_modules.tar.gz out of date, running npm install to get differing packages and updating node_modules_entrypoint_check.sha1"
        npm install
        npm prune
        echo "npm install complete"

        #echo "unzipping npm dependencies again"
        #tar -zxf /root/node_modules.tar.gz node_modules --checkpoint=100 --checkpoint-action="echo=Hit %s checkpoint #%u"
        #echo "unzipping complete"

        sha1sum /root/node_modules.tar.gz > node_modules_entrypoint_check.sha1
    fi
else
    echo "unzipping npm dependencies"
    tar -zxf /root/node_modules.tar.gz node_modules --checkpoint=100 --checkpoint-action="echo=Hit %s checkpoint #%u"
    echo "unzipping complete"
    sha1sum /root/node_modules.tar.gz > node_modules_entrypoint_check.sha1
fi

npm run build
pm2 start lab.config.js --watch

#start pennai
if [ ${AI_AUTOSTART} -eq 1 ]; then
    echo "autostarting ai..."

    echo "waiting for lab to be responsive..."
    /root/wait-for-it.sh -t 200 lab:5080

    echo "sleep..."
    sleep 20s
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
