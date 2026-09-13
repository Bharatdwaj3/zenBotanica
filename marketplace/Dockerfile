FROM node:20-slim

# Install build tools required to compile bcrypt
RUN apt-get update && apt-get install -y build-essential python3 && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 4003
CMD ["npm", "run", "dev"]
