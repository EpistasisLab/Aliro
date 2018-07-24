FROM node:8.11.2-slim
WORKDIR /jest
COPY package.json .
COPY tsconfig.json .
# RUN npm install --save es6-promise isomorphic-fetch
# RUN npm install --save-dev typescript jest ts-jest @types/jest
# RUN npm install --save-dev babel-jest babel-preset-react react-test-renderer babel-preset-es2015
# RUN npm install --save-dev babel-jest babel-preset-react react-test-renderer babel-preset-env 
RUN npm install 
RUN apt-get update && apt-get install -y vim dos2unix
COPY wait-for-it.sh /opt
RUN dos2unix /opt/wait-for-it.sh
RUN ["chmod", "+x", "/root/wait-for-it.sh"]
COPY entrypoint.sh /root
RUN dos2unix /root/entrypoint.sh
COPY jest .

CMD ["/bin/bash", "/root/entrypoint.sh"]