# Deployment Guide

## Prerequisites

- Node.js v18+
- MongoDB v6+
- PM2 (for production process management)
- Nginx (optional, for reverse proxy)

## Production Deployment

### 1. Install PM2

```bash
npm install -g pm2
```

### 2. Create PM2 Ecosystem File

Create `ecosystem.config.js` in the server root:

```javascript
module.exports = {
  apps: [
    {
      name: 'api-gateway',
      cwd: './api-gateway',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 1001
      }
    },
    {
      name: 'auth-service',
      cwd: './auth-service',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 1002
      }
    },
    {
      name: 'user-service',
      cwd: './user-service',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 1003
      }
    },
    {
      name: 'course-service',
      cwd: './course-service',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 1004
      }
    },
    {
      name: 'content-service',
      cwd: './content-service',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 1005
      }
    },
    {
      name: 'assessment-service',
      cwd: './assessment-service',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 1006
      }
    },
    {
      name: 'report-service',
      cwd: './report-service',
      script: 'server.js',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 1007
      }
    }
  ]
};
```

### 3. Start All Services

```bash
pm2 start ecosystem.config.js
```

### 4. PM2 Management Commands

```bash
# View all services
pm2 list

# View logs
pm2 logs

# View specific service logs
pm2 logs api-gateway

# Restart all services
pm2 restart all

# Stop all services
pm2 stop all

# Delete all services
pm2 delete all

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
```

## Docker Deployment

### 1. Create Dockerfile for each service

Example `Dockerfile` (place in each service directory):

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE <PORT>

CMD ["node", "server.js"]
```

### 2. Create docker-compose.yml

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:latest
    container_name: lms-mongodb
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db
    networks:
      - lms-network

  api-gateway:
    build: ./api-gateway
    container_name: lms-api-gateway
    ports:
      - "1001:1001"
    environment:
      - NODE_ENV=production
      - PORT=1001
    depends_on:
      - auth-service
      - user-service
      - course-service
      - content-service
      - assessment-service
      - report-service
    networks:
      - lms-network

  auth-service:
    build: ./auth-service
    container_name: lms-auth-service
    ports:
      - "1002:1002"
    environment:
      - NODE_ENV=production
      - PORT=1002
      - MONGODB_URI=mongodb://mongodb:27017/lms_auth
    depends_on:
      - mongodb
    networks:
      - lms-network

  # Add other services similarly...

volumes:
  mongodb_data:

networks:
  lms-network:
    driver: bridge
```

### 3. Start Docker Containers

```bash
docker-compose up -d
```

## Nginx Reverse Proxy

Create `/etc/nginx/sites-available/lms`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api/ {
        proxy_pass http://localhost:1001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/lms /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

## Environment Variables for Production

Make sure to set these securely:

```env
NODE_ENV=production
JWT_SECRET=<strong_random_string>
JWT_REFRESH_SECRET=<another_strong_random_string>
MONGODB_URI=<production_mongodb_uri>
```

## Security Checklist

- [ ] Use strong JWT secrets
- [ ] Enable HTTPS
- [ ] Configure proper CORS origins
- [ ] Set up MongoDB authentication
- [ ] Use environment variables for secrets
- [ ] Enable rate limiting
- [ ] Set up logging and monitoring
- [ ] Regular security updates
- [ ] Backup databases regularly

## Monitoring

### Using PM2 Plus (optional)

```bash
pm2 link <secret_key> <public_key>
```

### Log Rotation

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## Backup Strategy

### MongoDB Backup

```bash
# Backup all databases
mongodump --out /path/to/backup/$(date +%Y%m%d)

# Restore
mongorestore /path/to/backup/20231114
```

## Troubleshooting

### Check Service Status
```bash
pm2 status
```

### Check Logs
```bash
pm2 logs --lines 100
```

### Restart Failed Service
```bash
pm2 restart <service-name>
```

### Check Port Usage
```bash
netstat -tulpn | grep <port>
```
