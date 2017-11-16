cd ${PROJECT_ROOT}/Gp/machine
for metadata in `find ${PROJECT_ROOT}/Gp/machine/datasets/ | grep metadata`;do rm -f $metadata;done
rm -f ${PROJECT_ROOT}/Gp/machine/specs.json
pm2 start machine.config.js --watch
bash
