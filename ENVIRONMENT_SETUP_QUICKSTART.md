# 🚀 Environment Setup Quick Start

## 🎯 Quick Setup

### 1. Local Development (Docker PostgreSQL)
```bash
# Copy environment template
cp .env.local.example .env.local

# Start Docker services
bun run db:local:up

# Run app with local DB
bun run dev:local
```

### 2. Cloud Development (Neon DB)
```bash
# Copy environment template
cp .env.development.example .env.development

# Configure Neon credentials in .env.development
# Run app with Neon DB
bun run dev:cloud
```

## 📊 Environment Matrix

| Environment | Database | Command | Config File |
|------------|----------|---------|-------------|
| Local | Docker PostgreSQL | `bun run dev:local` | `.env.local` |
| Preview | Docker PostgreSQL | `bun run dev:preview` | `.env.local` |
| Development | Neon Cloud | `bun run dev:cloud` | `.env.development` |
| Staging | Neon Cloud | `APP_ENV=staging bun start` | `.env.staging` |
| Production | Neon Cloud | `APP_ENV=production bun start` | `.env.production` |

## 🔧 Database Commands

### Local Docker
```bash
# Start database
bun run db:local:up

# Stop database
bun run db:local:down

# Reset database
bun run db:local:reset

# View database
bun run db:studio:local
```

### Neon Cloud
```bash
# Run migrations
bun run db:migrate:dev

# View database
bun run db:studio:dev
```

## 🐳 Docker Services

### Available Services
- **postgres-local**: PostgreSQL 16 with multiple databases
- **redis-local**: Redis 7 for caching
- **pgadmin-local**: Database GUI (optional)

### Start All Services
```bash
docker-compose -f docker-compose.local.yml up -d
```

### View pgAdmin
```bash
# Start with tools profile
docker-compose -f docker-compose.local.yml --profile tools up -d

# Access at http://localhost:5050
# Login: admin@local.dev / admin123
```

## 🎨 Environment Features

### Local/Preview
- Hot reload enabled
- Debug mode active
- Dev tools enabled
- No SSL required
- Multiple test databases

### Development/Staging
- Neon Cloud database
- SSL connections
- Error tracking
- Performance monitoring
- Cloud infrastructure

### Production
- Full security
- Analytics enabled
- Error tracking
- No debug output
- Optimized performance

## 🚨 Common Issues

### Port Conflicts
```bash
# Check if ports are in use
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# Use custom ports in .env.local
POSTGRES_PORT=5433
REDIS_PORT=6380
```

### Database Connection
```bash
# Test local connection
psql postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev

# Check Docker logs
docker logs myexpo-postgres-local
```

### Environment Variables
```bash
# Verify environment
bun run scripts/check-environment.ts

# Debug environment
APP_ENV=local bun run start
```

## 📝 Quick Reference

```bash
# Development cycle
bun run db:local:up      # Start DB
bun run dev:local        # Start app
bun run db:studio:local  # View data

# Switch environments
APP_ENV=preview bun start
APP_ENV=development bun start

# Database operations
bun run db:migrate:local
bun run db:push
```

---

*For detailed documentation, see `docs/guides/ENVIRONMENT_STRATEGY.md`*