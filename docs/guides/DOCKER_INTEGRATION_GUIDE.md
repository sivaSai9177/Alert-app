# 🐳 Docker Integration Guide

*Version: 1.0.0 | Last Updated: June 6, 2025*

## 📋 Overview

This guide provides comprehensive instructions for using Docker with the My-Expo project, including development, testing, and multi-agent system deployment.

## 🚀 Quick Start

### Prerequisites
- Docker Desktop for Mac (latest version)
- 8GB+ RAM allocated to Docker
- 20GB+ free disk space

### Initial Setup
```bash
# 1. Clone environment file
cp .env.example .env.docker

# 2. Start core services
docker-compose up -d postgres redis

# 3. Run database migrations
docker-compose run --rm api bun run db:migrate

# 4. Start development environment
docker-compose --profile development up
```

## 🏗️ Architecture Overview

### Service Structure
```
┌─────────────────────────────────────────────────────┐
│                   Docker Network                     │
├─────────────┬──────────────┬───────────┬───────────┤
│  PostgreSQL │     Redis     │    API    │   Expo    │
│    :5432    │    :6379     │   :3000   │   :8081   │
├─────────────┼──────────────┼───────────┼───────────┤
│   pgAdmin   │   MailHog    │ DevTools  │  Agents   │
│    :5050    │    :8025     │     -     │     -     │
└─────────────┴──────────────┴───────────┴───────────┘
```

## 📦 Available Services

### Core Services (Always Running)
1. **PostgreSQL** - Main database
   - Port: 5432
   - Credentials: myexpo/myexpo123
   - Database: myexpo_dev

2. **Redis** - Caching and queues
   - Port: 6379
   - No authentication (development)

### Development Services
3. **API Server** - tRPC + Better Auth
   - Port: 3000
   - Auto-reload enabled
   - Volume-mounted source

4. **Expo Server** - React Native development
   - Port: 8081
   - Metro bundler included
   - Hot reload enabled

### Tool Services (Optional)
5. **pgAdmin** - Database management
   - Port: 5050
   - Email: admin@myexpo.com
   - Password: admin123

6. **MailHog** - Email testing
   - SMTP Port: 1025
   - Web UI: 8025

## 🎯 Common Workflows

### 1. Development Workflow
```bash
# Start everything
docker-compose --profile development up

# Start specific services
docker-compose up postgres redis api

# View logs
docker-compose logs -f api

# Execute commands in container
docker-compose exec api bun run db:studio
```

### 2. Database Management
```bash
# Create migration
docker-compose exec api bun run db:generate

# Run migrations
docker-compose exec api bun run db:migrate

# Open Drizzle Studio
docker-compose exec api bun run db:studio

# Access pgAdmin
open http://localhost:5050
```

### 3. Testing Workflow
```bash
# Run all tests
docker-compose -f docker-compose.test.yml run test-runner

# Run specific test file
docker-compose -f docker-compose.test.yml run test-runner bun test auth.test.ts

# Run with coverage
docker-compose -f docker-compose.test.yml run test-runner bun test --coverage

# E2E tests
docker-compose -f docker-compose.test.yml --profile e2e up
```

### 4. Multi-Agent Development
```bash
# Start agent system
docker-compose -f docker-compose.agents.yml --profile agents up

# View agent logs
docker-compose -f docker-compose.agents.yml logs -f manager-agent

# Execute agent command
docker-compose -f docker-compose.agents.yml exec manager-agent \
  bun run process-prd /workspace/docs/projects/my-app/PRD.md
```

## 🔧 Configuration

### Environment Variables
Create `.env.docker` with:
```env
# Database
POSTGRES_USER=myexpo
POSTGRES_PASSWORD=myexpo123
POSTGRES_DB=myexpo_dev
POSTGRES_PORT=5432

# Redis
REDIS_PORT=6379

# API
API_PORT=3000
NODE_ENV=development

# Expo
EXPO_PORT=8081
REACT_NATIVE_PACKAGER_HOSTNAME=localhost

# Auth
BETTER_AUTH_SECRET=your-secret-here
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Email (development)
SMTP_HOST=mailhog
SMTP_PORT=1025
```

### Docker Compose Profiles
- `development` - API + Expo servers
- `tools` - pgAdmin, MailHog, DevTools
- `agents` - Multi-agent system
- `e2e` - E2E testing
- `performance` - Performance testing

## 🛠️ Troubleshooting

### Common Issues

#### 1. Port Conflicts
```bash
# Check what's using a port
lsof -i :5432

# Use different ports in .env.docker
POSTGRES_PORT=5433
API_PORT=3001
```

#### 2. Database Connection Issues
```bash
# Check if PostgreSQL is healthy
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U myexpo -d myexpo_dev
```

#### 3. Expo Connection Issues
```bash
# For physical device testing
REACT_NATIVE_PACKAGER_HOSTNAME=<your-mac-ip>

# Find your IP
ifconfig | grep "inet " | grep -v 127.0.0.1
```

#### 4. Permission Issues
```bash
# Fix node_modules permissions
docker-compose exec expo chown -R node:node /app/node_modules

# Reset volumes
docker-compose down -v
docker-compose up
```

## 📊 Performance Optimization

### 1. Docker Desktop Settings
- Memory: 4GB minimum, 8GB recommended
- CPUs: 4+ cores recommended
- Disk: 20GB+ for images and volumes

### 2. Development Tips
```bash
# Use BuildKit for faster builds
export DOCKER_BUILDKIT=1

# Prune unused resources
docker system prune -a

# Monitor resource usage
docker stats
```

### 3. Volume Performance
```yaml
# For Mac, use delegated mounts
volumes:
  - .:/app:delegated
  - /app/node_modules  # Anonymous volume for better performance
```

## 🚀 Production Considerations

### 1. Security
- Use secrets management
- Enable authentication on Redis
- Use SSL/TLS for all services
- Scan images for vulnerabilities

### 2. Optimization
- Multi-stage builds
- Layer caching
- Minimal base images
- Health checks

### 3. Monitoring
- Container logs
- Resource metrics
- Health endpoints
- Alert configuration

## 📝 Useful Commands

### Development
```bash
# Start fresh
docker-compose down -v && docker-compose up --build

# Interactive shell
docker-compose exec api sh

# Run one-off command
docker-compose run --rm api bun install

# View running containers
docker-compose ps
```

### Debugging
```bash
# Inspect container
docker inspect myexpo-api

# View networks
docker network ls

# Check volumes
docker volume ls

# Container logs
docker logs -f myexpo-api
```

### Cleanup
```bash
# Stop all services
docker-compose down

# Remove volumes
docker-compose down -v

# Clean everything
docker system prune -a --volumes
```

## 🎯 Next Steps

1. **Development**: Start with core services
2. **Testing**: Set up test database
3. **Agents**: Configure multi-agent system
4. **Production**: Create production Dockerfiles

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Expo with Docker](https://docs.expo.dev/guides/using-docker/)

---

*This guide will be updated as the Docker integration evolves.*