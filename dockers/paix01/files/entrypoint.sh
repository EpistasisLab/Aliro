#!/bin/bash
export USERNAME=${PAIX_USER:-testuser}
cd ${PROJECT_ROOT}
#start the ai
python -m ai.ai -rec ${RECOMMENDER} -v -n ${NUMRECOMMEND} -u ${USERNAME}
while [ ! -f /tmp/die.txt ]
do
  sleep 2
done
cat /tmp/die.txt
