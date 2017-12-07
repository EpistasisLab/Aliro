#figure out where we are running 
wget localhost:51678/v1/metadata -t 1 -qO- &> /dev/null
if [ $? -eq 0 ]
then
    export ISAWS=1
else
    export ISAWS=0
fi
cd ${PROJECT_ROOT}
if [ $ISAWS ]
then
    sleep 60
    python -m ai.ai -rec ${RECOMMENDER} -v -n ${NUMRECOMMEND} -u ${PAIX_USER}
    while [ ! -f /tmp/die.txt ]
    do
      sleep 2
    done
    cat /tmp/die.txt
else
    python -m ai.ai -rec ${RECOMMENDER} -v -n ${NUMRECOMMEND} -u ${PAIX_USER}
    bash
fi
