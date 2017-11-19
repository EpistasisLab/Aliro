#    #clear out metadata and start from scratch
 rm -f ${PROJECT_ROOT}/machine/specs.json
#    for metadata in `find ${PROJECT_ROOT}/machine/datasets/ | grep metadata`;do rm -f $metadata;done
cd ${PROJECT_ROOT}/machine
if [ -d 'node_modules' ]; then
    echo "npm ready"
else
    echo "installing npm, bower and webpack"
    npm install
    npm -g install pm2
fi;

pm2 start machine.config.js
bash
