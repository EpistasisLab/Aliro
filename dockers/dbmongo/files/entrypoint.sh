#figure out where we are running
wget localhost:51678/v1/metadata -t 1 -qO- &> /dev/null
if [ $? -eq 0 ]
then
    export ISAWS=1
else
    export ISAWS=0
fi
if [ ! -v PROJECTS_FILE ]; then
    PROJECTS_FILE='projects.json';
fi
mongod -f /etc/mongod.conf &
#check to see if db was loaded
if [ ! -f '/root/forum' ]; then
    if [ -v FORUM ] && [ -d ${SHARE_PATH}/forums/${FORUM}/dump ]; then
        dumpdir=${SHARE_PATH}/forums/${FORUM}
        cd $dumpdir  && mongorestore dump/
    elif [ -v PARENTDB ]; then
        dumpdir=${SHARE_PATH}/forums/${PARENTDB}
        cd $dumpdir  && mongorestore dump/
    else
        mongoimport -d FGLab -c users --file /root/users.json --type json
        mongo FGLab --eval 'db.datasets.createIndex({username: 1})'
        mongo FGLab --eval 'db.datasets.createIndex({name: 1})'
        mongo FGLab --eval 'db.experiments.createIndex({username: 1})'
        mongo FGLab --eval 'db.experiments.createIndex({_dataset_id: 1})'
    fi
    mongoimport -d FGLab -c users --file /root/users.json --type json
    mongoimport -d FGLab -c projects --file /root/${PROJECTS_FILE} --type json
    mongo FGLab --eval 'db.projects.createIndex({name: 1})'
    mongo FGLab --eval 'db.users.createIndex({username: 1})'
    mongo FGLab --eval 'db.users.createIndex({apikey: 1})'
    touch /root/forum
fi
if [ ${ISAWS} -eq 1 ]  ||  [ -v NOBASH ];then
    let i=0
    while [ ! -f /tmp/die.txt ]
    do
      let i++
      sleep 2
      if [ $i -eq 150 ]
      then
          bash /root/sync.sh
          let i=0
      fi
    done
    cat /tmp/die.txt
else
    bash
fi
