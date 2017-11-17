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
webpack --watch &
pm2 start lab.config.js --watch
bash
