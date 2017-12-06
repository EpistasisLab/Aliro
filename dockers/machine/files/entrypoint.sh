cd ${PROJECT_ROOT}/machine
rm -f ${PROJECT_ROOT}/machine/specs.json
export IP=`wget -qO- http://instance-data/latest/meta-data/local-ipv4`
export MACHINE_URL=http://${IP}:${MACHINE_PORT}
pm2 start machine.config.js --watch
while [ ! -f /tmp/die.txt ]
do
  sleep 2
done
cat /tmp/die.txt
