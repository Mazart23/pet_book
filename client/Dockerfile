FROM node:18-alpine

WORKDIR /client/

COPY package.json .

RUN npm install --silent

COPY . .

CMD ["npm", "start"]