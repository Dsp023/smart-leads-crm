# ==========================================
# STAGE 1: Build static React assets
# ==========================================
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copy dependency configs
COPY package*.json ./
RUN npm install

# Copy source assets and configs
COPY tsconfig.json ./
COPY vite.config.ts ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY index.html ./
COPY src ./src

# Inject build variables
ENV VITE_API_URL=/api

# Compile React production bundle in /dist
RUN npm run build

# ==========================================
# STAGE 2: High Performance Nginx Web Server
# ==========================================
FROM nginx:stable-alpine

# Copy custom Nginx configuration mapping
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy production static assets from Stage 1 builder
COPY --from=builder /usr/src/app/dist /usr/share/nginx/html

EXPOSE 80

# Run Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
