#    #clear out metadata and start from scratch
cd ${PROJECT_ROOT}/machine
if [ ! -f '/root/forum' ]; then
    touch /root/forum
    rm -f ${PROJECT_ROOT}/machine/specs.json
    for metadata in `find ${PROJECT_ROOT}/machine/datasets/ | grep metadata`;do rm -f $metadata;done
fi

if [ -d 'node_modules/.staging' ]; then
    echo "npm partially installed, node_modules/.staging exists. Continuing install..."
    npm install
elif [ ! -d 'node_modules' ]; then
    echo "installing npm"
    npm install
else
    echo "npm ready"
fi


echo "waiting for lab to be responsive..."
/root/wait-for-it.sh -t 300 ${LAB_HOST}:${LAB_PORT} -- pm2 start machine.config.js

#pm2 start machine.config.js
pm2 logs
#bash
