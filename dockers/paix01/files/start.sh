#!/bin/bash
cd ${IFROOT}/penn-ai
#start the ai
python -m ai.ai -rec exhaustive -v -n 100
bash
