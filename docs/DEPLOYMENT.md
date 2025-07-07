# Deployment Guide

Complete guide for deploying Slate dashboard in development and production environments.

## Quick Deploy

### Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Dashboard available at http://localhost:5173
```

### Production
```bash
# Build for production
npm run build

# Serve with static server
cd dist && python3 -m http.server 8080

# Or use Docker
docker-compose up --build
```

## Docker Deployment

### Architecture

The dashboard uses a multi-container setup with Tailscale for secure networking:

```
[Tailscale Network]
     |
[dashboard-tailscale container] <- Tailscale sidecar
     |
[my-dashboard container] <- Shares network namespace
     |
[Nginx serving static files]
```

### Prerequisites

1. **Tailscale Account**: Create at https://tailscale.com
2. **Auth Key**: Generate at https://login.tailscale.com/admin/settings/keys
3. **Docker & Docker Compose**: Install from https://docker.com

### Environment Setup

Create `.env` file:

```bash
# Required: Tailscale auth key
TS_AUTHKEY=tskey-auth-xxxxx

# Optional: Additional Tailscale arguments
TS_EXTRA_ARGS=--accept-routes --exit-node=exit-node-name

# Optional: Docker registry for private images
DOCKER_REGISTRY=your-registry.com
```

### Development Deployment

```bash
# Build and start containers
docker-compose up --build

# View logs
docker-compose logs -f

# Stop containers
docker-compose down
```

Access dashboard:
- Via Tailscale: `http://dashboard.your-tailnet.ts.net`
- Via Tailscale IP: `http://100.x.x.x`

### Production Deployment

1. **Update environment for production**:
   ```bash
   # Use one-time auth key for production
   TS_AUTHKEY=tskey-auth-xxxxx-oneTime
   
   # Add resource limits
   DASHBOARD_MEMORY_LIMIT=128M
   DASHBOARD_CPU_LIMIT=0.5
   ```

2. **Deploy**:
   ```bash
   # Pull latest images
   docker-compose -f docker-compose.prod.yml pull
   
   # Deploy with zero downtime
   docker-compose -f docker-compose.prod.yml up -d
   
   # Check status
   docker-compose -f docker-compose.prod.yml ps
   ```

3. **Monitor**:
   ```bash
   # View logs
   docker-compose -f docker-compose.prod.yml logs -f
   
   # Check resource usage
   docker stats
   ```

### Container Configuration

#### Dashboard Container
```yaml
services:
  my-dashboard:
    build: .
    network_mode: "service:dashboard-tailscale"
    volumes:
      - ./config:/app/config:ro  # Read-only config
    restart: unless-stopped
    deploy:
      resources:
        limits:
          cpus: '0.5'
          memory: 128M
```

#### Tailscale Container
```yaml
services:
  dashboard-tailscale:
    image: tailscale/tailscale:latest
    hostname: dashboard
    environment:
      - TS_AUTHKEY=${TS_AUTHKEY}
      - TS_EXTRA_ARGS=${TS_EXTRA_ARGS}
      - TS_STATE_DIR=/var/lib/tailscale
    volumes:
      - tailscale-state:/var/lib/tailscale
    cap_add:
      - NET_ADMIN
      - NET_RAW
    restart: unless-stopped
```

## Static File Deployment

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name dashboard.your-domain.com;
    
    root /app/dist;
    index index.html;
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Fallback for SPA
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

### CDN Deployment

Deploy to CDN providers:

#### Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Custom domain
vercel domains add dashboard.your-domain.com
```

#### Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod --dir=dist
```

#### AWS S3 + CloudFront
```bash
# Build for production
npm run build

# Upload to S3
aws s3 sync dist/ s3://your-bucket-name --delete

# Invalidate CloudFront
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

## Server Deployment

### VPS/Dedicated Server

1. **Install Dependencies**:
   ```bash
   # Ubuntu/Debian
   sudo apt update
   sudo apt install nodejs npm nginx

   # CentOS/RHEL
   sudo yum install nodejs npm nginx
   ```

2. **Setup Application**:
   ```bash
   # Clone repository
   git clone https://github.com/your-username/slate.git
   cd slate

   # Install dependencies
   npm install

   # Build for production
   npm run build

   # Copy to web root
   sudo cp -r dist/* /var/www/html/
   ```

3. **Configure Nginx**:
   ```bash
   # Edit nginx config
   sudo nano /etc/nginx/sites-available/dashboard

   # Enable site
   sudo ln -s /etc/nginx/sites-available/dashboard /etc/nginx/sites-enabled/
   sudo systemctl reload nginx
   ```

### Process Management

#### PM2 (if using API server)
```bash
# Install PM2
npm install -g pm2

# Start API server
pm2 start server/server.js --name dashboard-api

# Save PM2 config
pm2 save
pm2 startup
```

#### Systemd Service
```ini
[Unit]
Description=Slate Dashboard API
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/slate
ExecStart=/usr/bin/node server/server.js
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

## Tailscale Configuration

### ACL Rules

Add to Tailscale admin console:

```json
{
  "tagOwners": {
    "tag:dashboard": ["your-email@example.com"]
  },
  "acls": [
    {
      "action": "accept",
      "src": ["group:users"],
      "dst": ["tag:dashboard:80"]
    }
  ]
}
```

### MagicDNS Setup

1. Enable MagicDNS in Tailscale admin
2. Dashboard accessible at `http://dashboard`
3. Or use hostname: `http://dashboard.your-tailnet.ts.net`

### Exit Node Configuration

```bash
# Allow dashboard to use exit node
TS_EXTRA_ARGS="--accept-routes --exit-node=exit-node-name"
```

## SSL/TLS Setup

### Let's Encrypt (Certbot)

```bash
# Install certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d dashboard.your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Tailscale TLS

```bash
# Enable HTTPS on Tailscale
tailscale cert dashboard.your-tailnet.ts.net
```

## Backup & Recovery

### Configuration Backup

```bash
# Manual backup
tar -czf dashboard-config-$(date +%Y%m%d).tar.gz config/

# Automated backup script
#!/bin/bash
BACKUP_DIR="/backups/dashboard"
DATE=$(date +%Y%m%d-%H%M%S)

mkdir -p "$BACKUP_DIR"
tar -czf "$BACKUP_DIR/config-$DATE.tar.gz" config/

# Keep only last 30 days
find "$BACKUP_DIR" -name "config-*.tar.gz" -mtime +30 -delete
```

### Full System Backup

```bash
# Docker volumes
docker run --rm -v dashboard_tailscale-state:/data -v $(pwd):/backup alpine tar czf /backup/tailscale-backup.tar.gz /data

# Application files
rsync -av /opt/slate/ /backup/slate/
```

## Monitoring & Logging

### Docker Logs

```bash
# View all logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f dashboard-tailscale

# Log rotation
docker-compose logs --tail=100 -f
```

### System Monitoring

```bash
# Resource usage
docker stats

# Container health
docker-compose ps

# Network status
docker network ls
docker network inspect slate_default
```

### Log Management

```yaml
# docker-compose.yml
services:
  my-dashboard:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## Security Considerations

### Network Security

1. **Tailscale ACLs**: Restrict access to necessary users/groups
2. **Firewall Rules**: Block unnecessary ports on host
3. **Container Isolation**: Use read-only mounts where possible

### Application Security

1. **API Keys**: Store in environment variables, not config files
2. **CORS**: Configure allowed origins for API endpoints
3. **Headers**: Add security headers in reverse proxy

### Container Security

```yaml
# Security enhancements
services:
  my-dashboard:
    security_opt:
      - no-new-privileges:true
    read_only: true
    tmpfs:
      - /tmp
    user: "1000:1000"
```

## Troubleshooting

### Common Issues

**Dashboard not accessible:**
- Check Tailscale connection: `tailscale status`
- Verify containers are running: `docker-compose ps`
- Check nginx logs: `docker-compose logs nginx`

**Configuration not loading:**
- Verify YAML syntax
- Check file permissions
- Restart containers: `docker-compose restart`

**Performance issues:**
- Monitor resource usage: `docker stats`
- Check for memory leaks
- Optimize widget update intervals

### Debug Mode

```bash
# Enable debug logging
docker-compose up --build -e DEBUG=1

# Connect to container
docker-compose exec my-dashboard /bin/sh
```

## Maintenance

### Updates

```bash
# Update dependencies
npm update

# Rebuild containers
docker-compose build --no-cache

# Update images
docker-compose pull
```

### Health Checks

```yaml
# docker-compose.yml
services:
  my-dashboard:
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### Scheduled Tasks

```bash
# Crontab for maintenance
0 2 * * * /opt/slate/scripts/backup.sh
0 4 * * 0 /opt/slate/scripts/update.sh
```