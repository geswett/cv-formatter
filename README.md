FROM node:22-slim

# LibreOffice se usa para convertir el .docx generado a .pdf manteniendo el formato exacto.
RUN apt-get update && \
    apt-get install -y --no-install-recommends libreoffice-writer fonts-liberation && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY . .

ENV PORT=3000
EXPOSE 3000

CMD ["node", "server/index.js"]
