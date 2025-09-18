# AI Code Platform Deployment Guide

## Overview

This guide covers deploying the AI Code Platform in various environments, from local development to production-scale deployments on cloud platforms.

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)
- PostgreSQL 15+
- Redis 7+

## Quick Start (Local Development)

### 1. Clone and Setup

```bash
git clone https://github.com/your-org/ai-code-platform.git
cd ai-code-platform

# Copy environment file
cp .env.example .env

# Edit .env with your API keys
nano .env
```

### 2. Start with Docker Compose

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f backend
```

### 3. Initialize Database

```bash
# Run database migrations
docker-compose exec backend alembic upgrade head

# Create initial admin user
docker-compose exec backend python -m app.create_admin
```

### 4. Access the Platform

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs
- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

## Production Deployment

### AWS Deployment

#### 1. Infrastructure Setup (Terraform)

```hcl
# infrastructure/main.tf
provider "aws" {
  region = var.aws_region
}

# ECS Cluster
resource "aws_ecs_cluster" "ai_code_platform" {
  name = "ai-code-platform"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Application Load Balancer
resource "aws_lb" "main" {
  name               = "ai-code-platform-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets           = aws_subnet.public[*].id
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier = "ai-code-platform-db"
  
  engine         = "postgres"
  engine_version = "15.4"
  instance_class = "db.t3.medium"
  
  allocated_storage     = 100
  max_allocated_storage = 1000
  storage_encrypted     = true
  
  db_name  = "ai_code_platform"
  username = var.db_username
  password = var.db_password
  
  vpc_security_group_ids = [aws_security_group.rds.id]
  db_subnet_group_name   = aws_db_subnet_group.main.name
  
  backup_retention_period = 7
  backup_window          = "03:00-04:00"
  maintenance_window     = "sun:04:00-sun:05:00"
  
  skip_final_snapshot = false
  final_snapshot_identifier = "ai-code-platform-final-snapshot"
}

# ElastiCache Redis
resource "aws_elasticache_subnet_group" "main" {
  name       = "ai-code-platform-cache-subnet"
  subnet_ids = aws_subnet.private[*].id
}

resource "aws_elasticache_replication_group" "redis" {
  replication_group_id       = "ai-code-platform-redis"
  description                = "Redis cluster for AI Code Platform"
  
  node_type                  = "cache.t3.micro"
  port                       = 6379
  parameter_group_name       = "default.redis7"
  
  num_cache_clusters         = 2
  automatic_failover_enabled = true
  multi_az_enabled          = true
  
  subnet_group_name = aws_elasticache_subnet_group.main.name
  security_group_ids = [aws_security_group.redis.id]
}
```

#### 2. Deploy with ECS

```bash
# Build and push images
aws ecr get-login-password --region us-west-2 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-west-2.amazonaws.com

# Backend
docker build -t ai-code-platform-backend ./backend
docker tag ai-code-platform-backend:latest <account>.dkr.ecr.us-west-2.amazonaws.com/ai-code-platform-backend:latest
docker push <account>.dkr.ecr.us-west-2.amazonaws.com/ai-code-platform-backend:latest

# Frontend
docker build -t ai-code-platform-frontend ./frontend
docker tag ai-code-platform-frontend:latest <account>.dkr.ecr.us-west-2.amazonaws.com/ai-code-platform-frontend:latest
docker push <account>.dkr.ecr.us-west-2.amazonaws.com/ai-code-platform-frontend:latest

# Deploy infrastructure
cd infrastructure
terraform init
terraform plan
terraform apply
```

### Google Cloud Platform (GKE)

#### 1. Setup GKE Cluster

```bash
# Create cluster
gcloud container clusters create ai-code-platform \
    --zone=us-central1-a \
    --num-nodes=3 \
    --enable-autoscaling \
    --min-nodes=1 \
    --max-nodes=10 \
    --machine-type=e2-standard-4

# Get credentials
gcloud container clusters get-credentials ai-code-platform --zone=us-central1-a
```

#### 2. Deploy with Kubernetes

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: ai-code-platform

---
# k8s/backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend
  namespace: ai-code-platform
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        image: gcr.io/your-project/ai-code-platform-backend:latest
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: database-url
        - name: OPENAI_API_KEY
          valueFrom:
            secretKeyRef:
              name: app-secrets
              key: openai-api-key
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/v1/health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5

---
# k8s/backend-service.yaml
apiVersion: v1
kind: Service
metadata:
  name: backend-service
  namespace: ai-code-platform
spec:
  selector:
    app: backend
  ports:
  - port: 80
    targetPort: 8000
  type: ClusterIP
```

```bash
# Deploy to GKE
kubectl apply -f k8s/
```

### Azure Container Instances

#### 1. Setup Azure Resources

```bash
# Create resource group
az group create --name ai-code-platform --location eastus

# Create container registry
az acr create --resource-group ai-code-platform --name aicodeplat --sku Basic

# Create PostgreSQL
az postgres server create \
    --resource-group ai-code-platform \
    --name ai-code-platform-db \
    --location eastus \
    --admin-user dbadmin \
    --admin-password <secure-password> \
    --sku-name GP_Gen5_2 \
    --version 11

# Create Redis Cache
az redis create \
    --resource-group ai-code-platform \
    --name ai-code-platform-redis \
    --location eastus \
    --sku Basic \
    --vm-size c0
```

#### 2. Deploy Container Instances

```yaml
# azure-container-instances.yaml
apiVersion: 2019-12-01
location: eastus
name: ai-code-platform
properties:
  containers:
  - name: backend
    properties:
      image: aicodeplat.azurecr.io/backend:latest
      resources:
        requests:
          cpu: 1
          memoryInGb: 2
      ports:
      - port: 8000
      environmentVariables:
      - name: DATABASE_URL
        secureValue: postgresql://dbadmin:<password>@ai-code-platform-db.postgres.database.azure.com:5432/postgres
  - name: frontend
    properties:
      image: aicodeplat.azurecr.io/frontend:latest
      resources:
        requests:
          cpu: 0.5
          memoryInGb: 1
      ports:
      - port: 3000
  osType: Linux
  ipAddress:
    type: Public
    ports:
    - protocol: tcp
      port: 8000
    - protocol: tcp
      port: 3000
type: Microsoft.ContainerInstance/containerGroups
```

## Environment Configuration

### Production Environment Variables

```bash
# .env.production
# API Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=false
SECRET_KEY=<strong-secret-key>

# Database (use connection pooling)
DATABASE_URL=postgresql://user:pass@db-host:5432/ai_code_platform?pool_size=20&max_overflow=30

# Redis (use cluster if available)
REDIS_URL=redis://redis-cluster:6379

# AI Services (use separate keys for production)
OPENAI_API_KEY=<production-openai-key>
ANTHROPIC_API_KEY=<production-anthropic-key>

# Security
JWT_SECRET_KEY=<jwt-secret>
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Monitoring
SENTRY_DSN=<sentry-dsn>
LOG_LEVEL=INFO

# Performance
WORKERS=4
MAX_REQUESTS=1000
MAX_REQUESTS_JITTER=100
TIMEOUT=300
```

## Monitoring and Observability

### 1. Prometheus Configuration

```yaml
# monitoring/prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'ai-code-platform-backend'
    static_configs:
      - targets: ['backend:8000']
    metrics_path: '/metrics'
    
  - job_name: 'ai-code-platform-frontend'
    static_configs:
      - targets: ['frontend:3000']
    metrics_path: '/metrics'
    
  - job_name: 'postgres'
    static_configs:
      - targets: ['postgres-exporter:9187']
    
  - job_name: 'redis'
    static_configs:
      - targets: ['redis-exporter:9121']
```

### 2. Grafana Dashboards

```json
{
  "dashboard": {
    "title": "AI Code Platform Metrics",
    "panels": [
      {
        "title": "API Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Code Generation Success Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "rate(code_generation_success_total[5m]) / rate(code_generation_total[5m]) * 100",
            "legendFormat": "Success Rate %"
          }
        ]
      }
    ]
  }
}
```

### 3. Logging Configuration

```python
# backend/core/logging.py
import logging
import sys
from pythonjsonlogger import jsonlogger

def setup_logging():
    logHandler = logging.StreamHandler(sys.stdout)
    formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(name)s %(levelname)s %(message)s"
    )
    logHandler.setFormatter(formatter)
    logger = logging.getLogger()
    logger.addHandler(logHandler)
    logger.setLevel(logging.INFO)
    return logger
```

## Security Considerations

### 1. API Security

```python
# backend/core/security.py
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer
import jwt

security = HTTPBearer()

async def verify_token(token: str = Depends(security)):
    try:
        payload = jwt.decode(token.credentials, SECRET_KEY, algorithms=["HS256"])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### 2. Rate Limiting

```python
# backend/middleware/rate_limit.py
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/v1/generate-code")
@limiter.limit("10/minute")
async def generate_code(request: Request, ...):
    # Implementation
    pass
```

### 3. Input Validation

```python
# backend/models/validation.py
from pydantic import BaseModel, validator
import re

class CodeGenerationRequest(BaseModel):
    description: str
    language: str
    
    @validator('description')
    def validate_description(cls, v):
        if len(v) > 10000:
            raise ValueError('Description too long')
        if re.search(r'<script|javascript:|data:', v, re.IGNORECASE):
            raise ValueError('Potentially malicious content detected')
        return v
```

## Backup and Recovery

### 1. Database Backup

```bash
#!/bin/bash
# scripts/backup-db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="ai_code_platform_backup_$DATE.sql"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_FILE

# Upload to S3
aws s3 cp $BACKUP_FILE s3://your-backup-bucket/database/

# Clean up local file
rm $BACKUP_FILE

echo "Backup completed: $BACKUP_FILE"
```

### 2. Automated Backup with Cron

```bash
# Add to crontab
0 2 * * * /path/to/scripts/backup-db.sh
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Create indexes for better performance
CREATE INDEX idx_code_reviews_created_at ON code_reviews(created_at);
CREATE INDEX idx_generated_code_language ON generated_code(language);
CREATE INDEX idx_users_email ON users(email);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM code_reviews WHERE created_at > NOW() - INTERVAL '7 days';
```

### 2. Redis Caching

```python
# backend/core/cache.py
import redis
import json
from typing import Optional

class CacheManager:
    def __init__(self, redis_url: str):
        self.redis = redis.from_url(redis_url)
    
    async def get(self, key: str) -> Optional[dict]:
        data = self.redis.get(key)
        return json.loads(data) if data else None
    
    async def set(self, key: str, value: dict, ttl: int = 3600):
        self.redis.setex(key, ttl, json.dumps(value))
```

### 3. CDN Configuration

```nginx
# nginx/nginx.conf
server {
    listen 80;
    server_name yourdomain.com;
    
    # Static file caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API proxy
    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   ```bash
   # Check memory usage
   docker stats
   
   # Increase memory limits
   docker-compose up -d --scale backend=2
   ```

2. **Database Connection Issues**
   ```bash
   # Check database connectivity
   docker-compose exec backend python -c "from core.database import engine; print(engine.execute('SELECT 1').scalar())"
   ```

3. **API Rate Limits**
   ```bash
   # Monitor API usage
   curl -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/usage
   ```

### Health Checks

```bash
#!/bin/bash
# scripts/health-check.sh

# Check API health
curl -f http://localhost:8000/api/v1/health || exit 1

# Check database
docker-compose exec postgres pg_isready || exit 1

# Check Redis
docker-compose exec redis redis-cli ping || exit 1

echo "All services healthy"
```

## Support and Maintenance

### Regular Maintenance Tasks

1. **Weekly**
   - Review logs for errors
   - Check disk usage
   - Update dependencies

2. **Monthly**
   - Database maintenance
   - Performance review
   - Security updates

3. **Quarterly**
   - Disaster recovery testing
   - Capacity planning
   - Architecture review

### Getting Help

- **Documentation**: https://docs.ai-code-platform.com
- **Support**: support@ai-code-platform.com
- **Community**: https://discord.gg/ai-code-platform
- **Issues**: https://github.com/ai-code-platform/issues