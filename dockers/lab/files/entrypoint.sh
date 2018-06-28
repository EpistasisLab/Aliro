#!/bin/bash
wget localhost:51678/v1/metadata -t 1 -qO- &> /dev/null

if [ $? -eq 0 ]
then
    export ISAWS=1
else
    export ISAWS=0
fi

cd ${PROJECT_ROOT}/lab

if [ -d 'node_modules' ]; then
    echo "npm ready"
else
    echo "unzipping npm dependencies"
    tar -zvxf /root/node_modules.tar.gz node_modules
    echo "unzipping complete"
    npm install
fi

if [ ! -d "../tmp" ]; then
    mkdir ../tmp
fi
npm run build
#npm install -g pm2
#touch .env
pm2 start lab.config.js --watch

#figure out where we are running
if [ ${ISAWS} -eq 1 ]
then
    while [ ! -f /tmp/die.txt ]
    do
      sleep 2
    done
    cat /tmp/die.txt
else
    #bash
    pm2 logs
fi
