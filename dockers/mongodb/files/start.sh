mongod -f /etc/mongod.conf &
mongorestore /dump
mongoimport -d FGLab -c users --file /root/users.json --type json
bash
