mongod -f /etc/mongod.conf &
    if [ -v PARENTDB ]; then
        dumpdir=${SHARE_PATH}/${NETWORK}/forums/${PARENTDB}
        cd $dumpdir  && mongorestore dump/
        mongoimport -d FGLab -c users --file /root/users.json --type json
        mongo FGLab --eval 'db.users.createIndex({username: 1})'
        mongo FGLab --eval 'db.users.createIndex({apikey: 1})'
    else
        mongoimport -d FGLab -c projects --file /root/projects.json --type json
        mongoimport -d FGLab -c users --file /root/users.json --type json
        mongo FGLab --eval 'db.datasets.createIndex({username: 1})'
        mongo FGLab --eval 'db.datasets.createIndex({name: 1})'
        mongo FGLab --eval 'db.users.createIndex({username: 1})'
        mongo FGLab --eval 'db.users.createIndex({apikey: 1})'
        mongo FGLab --eval 'db.experiments.createIndex({username: 1})'
        mongo FGLab --eval 'db.experiments.createIndex({_dataset_id: 1})'
        mongo FGLab --eval 'db.projects.createIndex({name: 1})'
    fi;
    touch /root/forum
while [ ! -f /tmp/die.txt ]
do
  sleep 2
done
cat /tmp/die.txt
