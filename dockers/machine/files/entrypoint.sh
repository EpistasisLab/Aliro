#figure out where we are running 
wget localhost:51678/v1/metadata -t 1 -qO- &> /dev/null
if [ $? -eq 0 ]
then
    export ISAWS=1
else
    export ISAWS=0
fi
cd ${PROJECT_ROOT}/machine
if [ -f '/root/forum' ]; then
    rm -f ${PROJECT_ROOT}/pennai/machine/specs.json
    touch /root/forum
fi
if [ $ISAWS ]
then
    export IP=`wget -qO- http://instance-data/latest/meta-data/local-ipv4`
    export MACHINE_URL=http://${IP}:${MACHINE_PORT}
fi
if [ -d 'node_modules' ]; then
    echo "npm ready"
else
    echo "installing npm, bower and webpack"
    npm install
fi
pm2 start machine.config.js --watch
if [ $ISAWS ]
then
    while [ ! -f /tmp/die.txt ]
    do
      sleep 2
    done
    cat /tmp/die.txt
else
    bash
fi
