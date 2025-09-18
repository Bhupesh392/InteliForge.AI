# 🚀 Quick Start Guide

## 1. Clone & Setup
```bash
cd "d:\AI Projects\ai-code-platform"
cp .env.example .env
```

## 2. Configure Environment
Edit `.env` file with your API keys:
```bash
OPENAI_API_KEY=your-openai-key-here
ANTHROPIC_API_KEY=your-anthropic-key-here
```

## 3. Start Services
```bash
docker-compose up -d
```

## 4. Initialize Database
```bash
docker-compose exec backend alembic upgrade head
```

## 5. Access Platform
- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/api/v1/health

## Troubleshooting
```bash
# Check services
docker-compose ps

# View logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart
```