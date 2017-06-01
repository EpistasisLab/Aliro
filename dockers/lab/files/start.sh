mongod -f /etc/mongod.conf &
mongorestore /dump
cd /share/devel/Gp/lab
cd git pull
webpack --watch &
pm2 start lab.config.js --watch
bash
