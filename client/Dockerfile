FROM node:18-alpine

WORKDIR /ping_pong/client

COPY package*.json .

RUN npm install

COPY . .

EXPOSE 5021

CMD ["npm", "run", "dev"]