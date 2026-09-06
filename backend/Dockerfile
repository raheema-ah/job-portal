# ================================
# Stage 1: Builder
# ================================
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source
COPY src/ ./src/

# ================================
# Stage 2: Production Runner
# ================================
FROM node:20-alpine AS runner

WORKDIR /app

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodeuser -u 1001

# Copy from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY package*.json ./

# Create uploads directory
RUN mkdir -p uploads && chown nodeuser:nodejs uploads

USER nodeuser

EXPOSE 5001

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
