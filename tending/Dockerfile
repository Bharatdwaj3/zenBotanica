FROM node:20-slim

RUN apt-get update && apt-get install -y openssl

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . . 


EXPOSE 4002

CMD ["npm", "run", "dev"]
