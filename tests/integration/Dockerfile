FROM node:8.11.2-slim
WORKDIR /jest
COPY package.json .
COPY tsconfig.json .
RUN npm install
# RUN npm install --save es6-promise isomorphic-fetch
# RUN npm install --save-dev typescript jest ts-jest @types/jest
RUN npm install --save-dev babel-jest babel-preset-react react-test-renderer babel-preset-es2015
RUN npm install 
COPY jest .