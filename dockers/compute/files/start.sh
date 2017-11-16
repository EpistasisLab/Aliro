cd ${PROJECT_ROOT}/machine
for metadata in `find ${PROJECT_ROOT}/machine/datasets/ | grep metadata`;do rm -f $metadata;done
rm -f ${PROJECT_ROOT}/machine/specs.json
pm2 start machine.config.js --watch
bash
