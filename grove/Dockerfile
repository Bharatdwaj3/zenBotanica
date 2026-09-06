FROM node:20-slim

RUN apt-get update && apt-get install -y openssl poppler-utils

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . . 


EXPOSE 4001

CMD ["npm", "run", "dev"]
