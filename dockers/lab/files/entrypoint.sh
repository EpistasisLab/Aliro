#figure out where we are running
wget localhost:51678/v1/metadata -t 1 -qO- &> /dev/null
if [ $? -eq 0 ]
then
    export ISAWS=1
else
    export ISAWS=0
fi
cd ${PROJECT_ROOT}/lab
if [ -d 'node_modules' ]; then
    echo "npm ready"
else
    echo "installing npm, bower and webpack"
    npm install
    npm install -g bower pm2 webpack webpack-dev-server
fi;
if [ -d 'bower_components' ]; then
    echo "bower ready"
else
    bower install --allow-root
fi;
webpack &
if [ -f '.env' ]; then
    touch .env
fi;

pm2 start lab.config.js --watch
#figure out where we are running
if [ ${ISAWS} -eq 1 ]
then
    while [ ! -f /tmp/die.txt ]
    do
      sleep 2
    done
    cat /tmp/die.txt
else
    bash
fi
