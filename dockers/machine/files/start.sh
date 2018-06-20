#    #clear out metadata and start from scratch
cd ${PROJECT_ROOT}/machine
if [ ! -f '/root/forum' ]; then
    touch /root/forum
    rm -f ${PROJECT_ROOT}/machine/specs.json
    for metadata in `find ${PROJECT_ROOT}/machine/datasets/ | grep metadata`;do rm -f $metadata;done
fi
if [ ! -d 'node_modules' ]; then
    echo "installing npm, bower and webpack"
    npm install
    npm -g install pm2
fi
sleep 5
pm2 start machine.config.js
pm2 logs
#bash
