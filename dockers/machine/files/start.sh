cd ${PROJECT_ROOT}/machine
if [ -f '/root/forum' ]; then
    echo "forum exists."
else
    #clear out metadata and start fro scratch
    rm -f ${PROJECT_ROOT}/machine/specs.json
    for metadata in `find ${PROJECT_ROOT}/machine/datasets/ | grep metadata`;do rm -f $metadata;done
    touch /root/forum
fi
    pm2 start machine.config.js
bash
