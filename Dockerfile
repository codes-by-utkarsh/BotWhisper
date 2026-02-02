FROM node:18-alpine

RUN addgroup -g 1001 ctfuser && \
    adduser -D -u 1001 -G ctfuser ctfuser

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && \
    npm cache clean --force

COPY --chown=ctfuser:ctfuser . .

RUN chmod -R 755 /app

USER ctfuser

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
