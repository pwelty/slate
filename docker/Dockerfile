# Multi-stage build for production
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY src/ ./src/
COPY core/ ./core/
COPY public/ ./public/
COPY vite.config.js ./
COPY index.html ./
COPY config/ ./config/
COPY scripts/ ./scripts/

# Create directories for config sync
RUN mkdir -p public slate-config

# Build the application (includes config processing)
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Create a symbolic link for dashboard.yaml that will be mounted at runtime
RUN ln -sf /app/config/dashboard.yaml /usr/share/nginx/html/dashboard.yaml

# The config directory will be mounted as a volume at runtime
# No need to copy config files into the image

# Health check using wget (available by default in alpine)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Expose port 80
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]