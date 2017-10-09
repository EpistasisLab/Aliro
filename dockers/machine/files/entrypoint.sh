cd ${IFROOT}/Gp/machine
rm -f ${IFROOT}/Gp/machine/specs.json
#/etc/init.d/ssh start
#ifconfig eth0
export IP=`wget -qO- http://instance-data/latest/meta-data/local-ipv4`
export FGMACHINE_URL=http://${IP}:${MACHINE_PORT}
node machine.js
