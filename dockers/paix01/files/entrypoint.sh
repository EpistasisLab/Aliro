#figure out where we are running 
cd ${PROJECT_ROOT}
while [ ! -f /tmp/die.txt ]
    do
      python -m ai.ai -rec ${RECOMMENDER} -v -n ${NUMRECOMMEND} -u ${PAIX_USER}
      echo "sleep"
      sleep 2
    done
    cat /tmp/die.txt
    bash
