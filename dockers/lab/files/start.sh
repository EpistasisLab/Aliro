mongod -f /etc/mongod.conf &
mongorestore /dump
cd /share/devel/Gp/lab
./service start
bash
