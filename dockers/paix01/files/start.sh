#!/bin/bash
cd ${PROJECT_ROOT}
#start the ai
python -m ai.ai -rec ${RECOMMENDER} -v -n ${NUMRECOMMEND}
bash
