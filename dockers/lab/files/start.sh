mongod -f /etc/mongod.conf &
mongorestore /dump
cd /share/devel/Gp/lab
pm2 start lab.config.js --watch
bash
