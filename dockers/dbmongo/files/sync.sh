[ -d ${SHARE_PATH}/${NETWORK}/forums/${forumName} ]  || mkdir ${SHARE_PATH}/${NETWORK}/forums/${forumName}
cd ${SHARE_PATH}/${NETWORK}/forums/${forumName}
mongodump --excludeCollection users --db FGLab
