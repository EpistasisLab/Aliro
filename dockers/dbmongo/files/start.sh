mongod -f /etc/mongod.conf &
sleep 2
mongoimport -d FGLab -c projects --file /root/projects.json --type json
mongoimport -d FGLab -c users --file /root/users.json --type json
mongo FGLab --eval 'db.datasets.createIndex({username: 1})'
mongo FGLab --eval 'db.datasets.createIndex({name: 1})'
mongo FGLab --eval 'db.users.createIndex({username: 1})'
mongo FGLab --eval 'db.users.createIndex({apikey: 1})'
mongo FGLab --eval 'db.experiments.createIndex({username: 1})'
mongo FGLab --eval 'db.experiments.createIndex({_dataset_id: 1})'
mongo FGLab --eval 'db.projects.createIndex({name: 1})'
bash
