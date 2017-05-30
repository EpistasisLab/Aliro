mongod -f /etc/mongod.conf &
mongorestore /dump
mongoimport -d FGLab -c users initialize/users.json
cd /share/devel/Gp/lab
webpack --watch &
mongoimport -d FGLab -c users --file initialize/users.json --type json
pm2 start lab.config.js --watch
bash
