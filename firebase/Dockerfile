FROM eclipse-temurin:21-jre-jammy
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*
RUN npm install -g firebase-tools
WORKDIR /app
COPY firebase.json ./
COPY storage.rules ./
EXPOSE 9099 9199 4000
RUN mkdir -p /data
CMD ["firebase", "emulators:start", "--only", "auth,storage", "--project", "demo-project", "--import=/data/export", "--export-on-exit=/data/export"]
