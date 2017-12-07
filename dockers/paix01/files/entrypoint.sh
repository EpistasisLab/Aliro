#figure out where we are running 
cd ${PROJECT_ROOT}
while [ ! -f /tmp/die.txt ]
    do
      env
      python -m ai.ai -rec ${RECOMMENDER} -v -n ${NUMRECOMMEND} -u testuser
      echo "sleep"
      sleep 2
    done
    cat /tmp/die.txt
    bash
