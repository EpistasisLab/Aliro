[ -d ${SHARE_PATH}/forums/${FORUM}/dump ]  || mkdir ${SHARE_PATH}/forums/${FORUM}
cd ${SHARE_PATH}/forums/${FORUM}
mongodump --excludeCollection users --db FGLab
