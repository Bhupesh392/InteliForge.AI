#!/bin/bash

echo "🚀 AI Code Platform Deployment Script"
echo "======================================"

# Build frontend
echo "📦 Building frontend..."
cd ../frontend
npm run build
cd ../deployment

# Build Docker images
echo "🐳 Building Docker images..."
docker build -t ai-platform-frontend:latest ../frontend
docker build -t ai-platform-backend:latest ../backend

# Deploy with Docker Compose
echo "🚀 Deploying with Docker Compose..."
docker-compose -f docker-compose.prod.yml up -d

echo "✅ Deployment complete!"
echo "Frontend: http://localhost"
echo "Backend: http://localhost:8000"