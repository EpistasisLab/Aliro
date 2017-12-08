[ -d ${SHARE_PATH}/${NETWORK}/forums/${FORUM}/dump ]  || mkdir ${SHARE_PATH}/${NETWORK}/forums/${FORUM}
cd ${SHARE_PATH}/${NETWORK}/forums/${FORUM}
mongodump --excludeCollection users --db FGLab
