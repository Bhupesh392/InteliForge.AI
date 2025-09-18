# 🚀 Deployment Guide

## Quick Deploy

### Using Docker Compose
```bash
cd deployment
docker-compose -f docker-compose.prod.yml up -d
```

### Using Deploy Script
```bash
cd deployment
./deploy.sh
```

## Files Overview

- `docker-compose.prod.yml` - Production Docker setup
- `kubernetes.yml` - Kubernetes deployment
- `nginx.conf` - Nginx configuration
- `deploy.sh` - Automated deployment script

## Production URLs

- **Frontend**: http://localhost
- **Backend**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs