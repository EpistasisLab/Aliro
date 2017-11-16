cd ${PROJECT_ROOT}/Gp/lab
if [ -f '/root/forum' ]; then
    echo "forum exists."
else
    bower install --allow-root
    touch /root/forum
fi;
webpack --watch &
pm2 start lab.config.js --watch
bash
