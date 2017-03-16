mongod -f /etc/mongod.conf &
mongorestore /dump
cd /share/devel/Gp/lab
webpack --watch &
#mongoimport -d FGLab -c users --file examples/Users/Users.js --type json
pm2 start lab.config.js --watch
bash
