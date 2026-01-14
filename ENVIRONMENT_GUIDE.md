# 🌍 Environment Configuration Guide

## Overview

This project uses a single `.env` file with environment-specific database URLs. The `APP_ENV` variable determines which configuration to use.

## Environment Variables

### Database URLs in `.env`
```bash
# Local Docker PostgreSQL
LOCAL_DATABASE_URL=postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev
PREVIEW_DATABASE_URL=postgresql://myexpo:myexpo123@localhost:5432/myexpo_preview

# Neon Cloud Database
NEON_DATABASE_URL=postgresql://[user]:[pass]@[host].neon.tech/neondb?sslmode=require
NEON_DATABASE_POOL_URL=postgresql://[user]:[pass]@[host]-pooler.neon.tech/neondb?sslmode=require
```

### Available Environments
- `local` - Local Docker PostgreSQL (myexpo_dev database)
- `preview` - Local Docker PostgreSQL (myexpo_preview database)
- `development` - Neon Cloud Database
- `staging` - Neon Cloud Database
- `production` - Neon Cloud Database

## Scripts

### Development
```bash
# Local development with Docker
bun run dev:local

# Preview environment
bun run dev:preview

# Cloud development
bun run dev:development
bun run dev:staging
bun run dev:production
```

### Database Management
```bash
# Docker services
bun run db:local:up      # Start PostgreSQL & Redis
bun run db:local:down    # Stop services
bun run db:local:reset   # Reset and restart

# Drizzle Studio (Database GUI)
bun run db:studio:local      # Local database
bun run db:studio:preview    # Preview database
bun run db:studio:dev        # Development (Neon)
bun run db:studio:staging    # Staging (Neon)
bun run db:studio:prod       # Production (Neon)

# Database migrations
bun run db:push:local        # Push schema to local
bun run db:push:preview      # Push schema to preview
bun run db:push:dev          # Push schema to development

# Run migrations
bun run db:migrate:local
bun run db:migrate:preview
bun run db:migrate:dev
bun run db:migrate:staging
bun run db:migrate:prod
```

## How It Works

1. **Single `.env` file** contains all database URLs
2. **`APP_ENV` variable** determines which database to use
3. **`lib/core/env-config.ts`** selects the appropriate database URL based on `APP_ENV`
4. **No need for multiple .env files** (.env.local, .env.development, etc.)

## Quick Start

### Local Development
```bash
# 1. Start Docker services
bun run db:local:up

# 2. Push database schema
bun run db:push:local

# 3. Start development server
bun run dev:local

# 4. Open database GUI (optional)
bun run db:studio:local
```

### Cloud Development
```bash
# 1. Ensure Neon credentials are in .env
# 2. Push schema (if needed)
bun run db:push:dev

# 3. Start development server
bun run dev:development
```

## Environment Detection

The system automatically detects the environment from:
1. `APP_ENV` environment variable (highest priority)
2. `NODE_ENV` environment variable
3. Defaults to 'local' if neither is set

## Benefits

- **Simpler configuration**: One `.env` file to manage
- **Clear separation**: Different database URLs for each environment
- **Easy switching**: Just change `APP_ENV` to switch environments
- **No file conflicts**: No need to manage multiple .env files
- **Consistent behavior**: Same configuration system everywhere