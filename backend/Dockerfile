# ==========================================
# STAGE 1: Build & Compile TypeScript
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy package dependencies first for caching optimization
COPY package*.json ./
RUN npm install

# Copy source code and build config
COPY tsconfig.json ./
COPY src ./src

# Compile TypeScript to JavaScript in /dist
RUN npm run build

# ==========================================
# STAGE 2: Production Execution Runtime
# ==========================================
FROM node:20-alpine

WORKDIR /usr/src/app

# Copy package configuration
COPY package*.json ./
# Install only production dependencies (no devDependencies, keeps image tiny!)
RUN npm install --only=production

# Copy compiled files from Stage 1 builder
COPY --from=builder /usr/src/app/dist ./dist

# Expose port
EXPOSE 5000

ENV NODE_ENV=production

# Boot Express Server
CMD ["node", "dist/server.js"]
