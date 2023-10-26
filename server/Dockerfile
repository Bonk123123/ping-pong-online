FROM node:18-alpine

WORKDIR /ping_pong/server

COPY package*.json ./

RUN npm install

ENV POSTGRES_HOST=postgres

ENV POSTGRES_PORT=5432

ENV POSTGRES_USER=postgres

ENV POSTGRES_PASSWORD=postgres

ENV POSTGRES_DB=ping_pong

ENV PORT=5000

COPY . .

CMD [ "npm", "run", "start" ]