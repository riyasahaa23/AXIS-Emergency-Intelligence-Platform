# Multi-stage production Dockerfile for AXIS Web Frontend
# Build Stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root workspace manifests
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Install dependencies using clean install
RUN npm ci

# Copy web source
COPY apps/web ./apps/web
COPY turbo.json ./

# Build production bundle
ENV NODE_ENV=production
RUN npm run build --workspace=@axis/web

# Production Runner Stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5180
ENV HOST=0.0.0.0

# Non-root security user
USER node

# Copy built artifacts from builder stage
COPY --chown=node:node --from=builder /app/apps/web/build ./build
COPY --chown=node:node --from=builder /app/apps/web/package.json ./package.json
COPY --chown=node:node --from=builder /app/node_modules ./node_modules

EXPOSE 5180

CMD ["node", "build/index.js"]
