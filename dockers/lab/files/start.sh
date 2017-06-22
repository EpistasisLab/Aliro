cd ${IFROOT}/Gp/lab
webpack --watch &
pm2 start lab.config.js --watch
bash
