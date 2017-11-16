cd ${PROJECT_ROOT}/Gp/machine
if [ -f '/root/forum' ]; then
    echo "forum exists."
else
    #clear out metadata and start fro scratch
    rm -f ${PROJECT_ROOT}/Gp/machine/specs.json
    for metadata in `find ${PROJECT_ROOT}/Gp/machine/datasets/ | grep metadata`;do rm -f $metadata;done
    touch /root/forum
fi
    pm2 start machine.config.js
bash
