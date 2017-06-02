mongod -f /etc/mongod.conf &
mongorestore /dump
cd /share/devel/Gp/lab
#git pull
#mongoimport -d FGLab -c users --file initialize/users.json --type json
webpack --watch &
pm2 start lab.config.js --watch
bash
