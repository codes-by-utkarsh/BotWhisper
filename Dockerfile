FROM node:20-slim

RUN apt-get update && apt-get install -y \
    chromium \
    fonts-freefont-ttf \
    ca-certificates \
    --no-install-recommends \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

RUN groupadd -g 1001 ctfuser && \
    useradd -u 1001 -g ctfuser -m ctfuser

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force

COPY --chown=ctfuser:ctfuser . .

RUN chmod -R 755 /app

USER ctfuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) =>{process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
