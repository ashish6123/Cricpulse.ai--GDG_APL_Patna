# Use Node 20 slim for smallest possible image (GCP Cloud Run optimized)
FROM node:20-slim

WORKDIR /app

# Copy package files first (layer cache optimization)
COPY package*.json ./
RUN npm ci --omit=dev

# Copy source
COPY . .

# Cloud Run sets PORT automatically; default 5000 for local
ENV PORT=5000
ENV NODE_ENV=production

EXPOSE 5000

# Healthcheck so Cloud Run knows when the container is ready
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:'+process.env.PORT+'/health', r => process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"

CMD ["node", "server.js"]
