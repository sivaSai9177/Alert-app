# 🌍 Environment Strategy & Database Configuration

*Version: 1.1.0 | Last Updated: June 6, 2025*

## ✅ Status: Local Docker Environment Successfully Running
- PostgreSQL 16: Running on port 5432 with 3 databases
- Redis 7: Running on port 6379
- All health checks passing

## 📋 Overview

This document outlines our multi-environment strategy using Neon DB for cloud development and local PostgreSQL with Docker for local development.

## 🗄️ Database Strategy

### Environment-Database Mapping

| Environment | Database | Use Case | Connection |
|------------|----------|----------|------------|
| **Local Development** | Docker PostgreSQL | Local testing, offline work | `postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev` |
| **Development Preview** | Docker PostgreSQL | PR previews, branch testing | `postgresql://myexpo:myexpo123@localhost:5432/myexpo_preview` |
| **Development Builds** | Neon DB | Shared dev, EAS builds | `postgresql://[user]:[pass]@[host].neon.tech/myexpo_dev` |
| **Staging** | Neon DB | Pre-production testing | `postgresql://[user]:[pass]@[host].neon.tech/myexpo_staging` |
| **Production** | Neon DB | Live application | `postgresql://[user]:[pass]@[host].neon.tech/myexpo_prod` |

## 🔧 Environment Configuration

### 1. Environment Files Structure

```
.env.local          # Local development (Docker PostgreSQL)
.env.preview        # Preview builds (Docker PostgreSQL)
.env.development    # Development builds (Neon DB)
.env.staging        # Staging (Neon DB)
.env.production     # Production (Neon DB)
.env.example        # Template with all variables
```

### 2. Environment Variables

#### .env.local (Docker PostgreSQL)
```env
# Database
DATABASE_URL=postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev
DATABASE_POOL_URL=postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev

# Environment
NODE_ENV=development
APP_ENV=local

# API
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_APP_ENV=local

# Auth
BETTER_AUTH_URL=http://localhost:8081
BETTER_AUTH_SECRET=local-secret-change-me

# Features
EXPO_PUBLIC_USE_LOCAL_DB=true
EXPO_PUBLIC_ENABLE_DEBUG=true
```

#### .env.development (Neon DB)
```env
# Database (Neon)
DATABASE_URL=postgresql://user:pass@host.neon.tech/myexpo_dev?sslmode=require
DATABASE_POOL_URL=postgresql://user:pass@host-pooler.neon.tech/myexpo_dev?sslmode=require

# Environment
NODE_ENV=development
APP_ENV=development

# API
EXPO_PUBLIC_API_URL=https://dev-api.myexpo.com
EXPO_PUBLIC_APP_ENV=development

# Auth
BETTER_AUTH_URL=https://dev.myexpo.com
BETTER_AUTH_SECRET=dev-secret-from-vault

# Features
EXPO_PUBLIC_USE_LOCAL_DB=false
EXPO_PUBLIC_ENABLE_DEBUG=true
```

## 🐳 Docker Configuration for Local Development

### docker-compose.local.yml
```yaml
version: '3.8'

services:
  # Local PostgreSQL for development
  postgres-local:
    image: postgres:16-alpine
    container_name: myexpo-postgres-local
    environment:
      POSTGRES_USER: myexpo
      POSTGRES_PASSWORD: myexpo123
      POSTGRES_MULTIPLE_DATABASES: myexpo_dev,myexpo_preview,myexpo_test
    ports:
      - "5432:5432"
    volumes:
      - local_postgres_data:/var/lib/postgresql/data
      - ./scripts/init-multiple-db.sh:/docker-entrypoint-initdb.d/init-multiple-db.sh
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U myexpo"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Local Redis
  redis-local:
    image: redis:7-alpine
    container_name: myexpo-redis-local
    ports:
      - "6379:6379"
    volumes:
      - local_redis_data:/data

  # pgAdmin for local DB management
  pgadmin-local:
    image: dpage/pgadmin4:latest
    container_name: myexpo-pgadmin-local
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@local.dev
      PGADMIN_DEFAULT_PASSWORD: admin123
    ports:
      - "5050:80"
    depends_on:
      - postgres-local

volumes:
  local_postgres_data:
  local_redis_data:
```

## 🤖 Agent-Specific Environment Handling

### Manager Agent
```typescript
class ManagerAgent {
  getEnvironmentConfig(targetEnv: string) {
    const configs = {
      local: {
        database: 'Docker PostgreSQL',
        apiUrl: 'http://localhost:3000',
        features: ['debug', 'hot-reload', 'local-db']
      },
      development: {
        database: 'Neon DB (Dev)',
        apiUrl: 'https://dev-api.myexpo.com',
        features: ['debug', 'cloud-db', 'eas-updates']
      },
      staging: {
        database: 'Neon DB (Staging)',
        apiUrl: 'https://staging-api.myexpo.com',
        features: ['cloud-db', 'monitoring']
      },
      production: {
        database: 'Neon DB (Prod)',
        apiUrl: 'https://api.myexpo.com',
        features: ['cloud-db', 'monitoring', 'analytics']
      }
    };
    
    return configs[targetEnv];
  }
}
```

### Backend Developer Agent
```typescript
// Environment-aware database connection
const getDatabaseConfig = (env: string) => {
  switch (env) {
    case 'local':
    case 'preview':
      return {
        connectionString: process.env.DATABASE_URL,
        ssl: false,
        pooling: false
      };
    
    case 'development':
    case 'staging':
    case 'production':
      return {
        connectionString: process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        pooling: true,
        poolUrl: process.env.DATABASE_POOL_URL
      };
    
    default:
      throw new Error(`Unknown environment: ${env}`);
  }
};
```

### Frontend Developer Agent
```typescript
// Environment-aware API configuration
const getAPIConfig = () => {
  const env = process.env.EXPO_PUBLIC_APP_ENV || 'local';
  
  return {
    baseURL: process.env.EXPO_PUBLIC_API_URL,
    timeout: env === 'local' ? 30000 : 10000,
    retries: env === 'production' ? 3 : 1,
    cache: env !== 'local',
    debug: env !== 'production'
  };
};
```

## 📦 EAS Build Configuration

### eas.json
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "env": {
        "APP_ENV": "development",
        "DATABASE_TYPE": "neon"
      }
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "APP_ENV": "staging",
        "DATABASE_TYPE": "neon"
      }
    },
    "production": {
      "env": {
        "APP_ENV": "production",
        "DATABASE_TYPE": "neon"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

## 🔄 Environment Switching

### Quick Commands

```bash
# Local development (Docker PostgreSQL)
npm run dev:local
# or
APP_ENV=local docker-compose -f docker-compose.local.yml up

# Development preview (Docker PostgreSQL)
npm run dev:preview
# or
APP_ENV=preview docker-compose -f docker-compose.local.yml up

# Development build (Neon DB)
npm run dev:cloud
# or
APP_ENV=development npm run dev

# EAS builds (always use Neon)
eas build --profile development
eas build --profile preview
eas build --profile production
```

### Package.json Scripts
```json
{
  "scripts": {
    "dev:local": "APP_ENV=local expo start",
    "dev:preview": "APP_ENV=preview expo start",
    "dev:cloud": "APP_ENV=development expo start",
    "db:local:up": "docker-compose -f docker-compose.local.yml up -d postgres-local",
    "db:local:down": "docker-compose -f docker-compose.local.yml down",
    "db:local:reset": "docker-compose -f docker-compose.local.yml down -v && npm run db:local:up",
    "db:migrate:local": "APP_ENV=local drizzle-kit migrate",
    "db:migrate:dev": "APP_ENV=development drizzle-kit migrate",
    "db:studio:local": "APP_ENV=local drizzle-kit studio",
    "db:studio:dev": "APP_ENV=development drizzle-kit studio"
  }
}
```

## 🛡️ Security Considerations

### 1. Environment Isolation
- Never commit `.env` files (only `.env.example`)
- Use different auth secrets per environment
- Separate OAuth credentials per environment
- Different API keys for each environment

### 2. Database Access
- Local: No SSL required (Docker network)
- Neon: Always use SSL connections
- Use connection pooling for Neon
- Implement IP whitelisting for production

### 3. Secret Management
```bash
# Development secrets (can be in .env files)
BETTER_AUTH_SECRET=dev-secret-okay-to-share

# Production secrets (use secret manager)
BETTER_AUTH_SECRET=${SECRET_MANAGER_AUTH_SECRET}
DATABASE_URL=${SECRET_MANAGER_DB_URL}
```

## 📊 Environment Features Matrix

| Feature | Local | Dev Preview | Dev Build | Staging | Production |
|---------|--------|-------------|-----------|---------|------------|
| Hot Reload | ✅ | ✅ | ✅ | ❌ | ❌ |
| Debug Mode | ✅ | ✅ | ✅ | ⚠️ | ❌ |
| Local DB | ✅ | ✅ | ❌ | ❌ | ❌ |
| Neon DB | ❌ | ❌ | ✅ | ✅ | ✅ |
| EAS Updates | ❌ | ❌ | ✅ | ✅ | ✅ |
| Analytics | ❌ | ❌ | ⚠️ | ✅ | ✅ |
| Error Tracking | ❌ | ❌ | ✅ | ✅ | ✅ |
| Rate Limiting | ❌ | ❌ | ⚠️ | ✅ | ✅ |

## 🚀 Best Practices

1. **Local Development**
   - Use Docker PostgreSQL for fast iteration
   - No internet required
   - Reset database easily
   - Test migrations locally first

2. **Development Builds**
   - Use Neon DB for team collaboration
   - Share data between developers
   - Test with production-like environment
   - Use for EAS builds

3. **Preview Environments**
   - Spin up per PR/branch
   - Isolated Docker PostgreSQL
   - Clean slate for testing
   - Automated cleanup

4. **Production**
   - Neon DB with connection pooling
   - SSL everywhere
   - Monitoring enabled
   - Backups configured

## 🎯 Recommended Workflow

1. **Feature Development**
   ```bash
   # Start local environment
   npm run db:local:up
   npm run dev:local
   
   # Make changes, test locally
   # Run migrations
   npm run db:migrate:local
   ```

2. **Team Collaboration**
   ```bash
   # Switch to cloud development
   npm run dev:cloud
   
   # Share database state with team
   # Test integrations
   ```

3. **PR/Preview**
   ```bash
   # Create preview environment
   docker-compose -f docker-compose.local.yml up -d
   npm run dev:preview
   
   # Test in isolation
   # Run E2E tests
   ```

4. **Release**
   ```bash
   # Build for staging
   eas build --profile preview
   
   # Test on staging (Neon)
   # Build for production
   eas build --profile production
   ```

---

*This environment strategy provides flexibility for local development while maintaining consistency with production infrastructure.*