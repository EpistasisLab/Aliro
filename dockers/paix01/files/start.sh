#!/bin/bash
export USERNAME=${PAIX_USER:-testuser}
cd ${PROJECT_ROOT}
#start the ai
python -m ai.ai -rec ${RECOMMENDER} -v -n ${NUMRECOMMEND} -u ${USERNAME}
bash
