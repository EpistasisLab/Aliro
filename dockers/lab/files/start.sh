mongod -f /etc/mongod.conf &
mongorestore /dump
cd /share/devel/Gp/lab
#mongoimport -d FGLab -c users --file examples/Users/Users.json --type json
pm2 start lab.config.js --watch
bash
