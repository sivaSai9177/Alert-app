# Claude Agent Script Guide

## Overview
This guide helps Claude agents understand and use the script system effectively in this Expo project. The scripts are designed to handle different environments automatically and provide a smooth development experience.

## Environment System

### Core Environment Variables
- `APP_ENV` - Controls which database to use (local, development, staging, production)
- `DATABASE_URL` - Dynamically set based on APP_ENV
- `EXPO_PUBLIC_API_URL` - API endpoint for the app

### Environment Detection
```bash
# Local (Docker PostgreSQL)
APP_ENV=local → Uses localhost:5432

# Development/Staging/Production (Neon Cloud)
APP_ENV=development → Uses Neon cloud database
```

## Essential Scripts for Claude Agents

### 1. Starting the App

#### Local Development with Healthcare
```bash
# Best option - handles everything automatically
bun run local:healthcare

# Alternative methods
./scripts/fix-oauth-local.sh    # Fixes OAuth + starts app
./scripts/start-with-healthcare.sh  # Auto-detects environment
```

#### Regular Local Development
```bash
bun run local                    # Expo Go with local database
bun run expo:go:local           # Alternative command
```

#### Development Environment (Neon Cloud)
```bash
bun run dev                      # Uses Neon cloud database
bun run dev:healthcare          # With healthcare setup
```

### 2. Database Management

#### Local Database Commands
```bash
# Start/stop local database
bun run db:local:up             # Start Docker PostgreSQL
bun run db:local:down           # Stop Docker PostgreSQL
bun run db:local:reset          # Reset local database

# Migrations and setup
bun run db:migrate:local        # Run migrations on local
bun run db:studio:local         # Open Drizzle Studio for local
```

#### Healthcare Setup
```bash
# Setup healthcare tables and data
bun run healthcare:setup        # Uses current environment
bun run healthcare:setup:local  # Force local database
bun run healthcare:setup:dev    # Force Neon database
```

### 3. Testing and Debugging

#### Test Endpoints
```bash
bun run scripts/test-healthcare-endpoints.ts
bun run api:health              # Quick health check
```

#### Check Environment
```bash
bun run scripts/check-build-environment.ts
```

### 4. OAuth and Authentication

#### Fix OAuth Issues
```bash
# OAuth requires localhost (not IP addresses)
./scripts/fix-oauth-local.sh    # Sets up OAuth properly
```

#### Reset User Data
```bash
bun run reset-profile           # Reset profile completion
bun run delete-user            # Delete test users
```

## Common Tasks for Claude Agents

### Task 1: Start Fresh Development Environment
```bash
# 1. Reset everything
bun run db:local:reset

# 2. Start with healthcare
bun run local:healthcare

# 3. Access at http://localhost:8081
```

### Task 2: Fix OAuth Login Issues
```bash
# Use the OAuth fix script
./scripts/fix-oauth-local.sh

# This script:
# - Forces localhost URLs (required for Google OAuth)
# - Checks database is running
# - Sets up healthcare tables
# - Starts Expo properly
```

### Task 3: Switch Between Environments
```bash
# Local environment
APP_ENV=local bun run start:healthcare

# Development environment (Neon)
APP_ENV=development bun run start:healthcare

# The start:healthcare script auto-detects and configures
```

### Task 4: Debug Database Issues
```bash
# Check if local database is running
docker ps | grep myexpo-postgres-local

# View database logs
docker logs myexpo-postgres-local

# Connect to database directly
docker exec -it myexpo-postgres-local psql -U myexpo -d myexpo_dev

# List tables
\dt

# Check healthcare tables
SELECT * FROM alerts;
SELECT * FROM healthcare_users;
```

## Script Philosophy

### 1. Environment-Aware Scripts
All scripts should detect the environment and use appropriate settings:
```typescript
const DATABASE_URL = process.env.DATABASE_URL || 
  (process.env.APP_ENV === 'local' 
    ? 'postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev'
    : process.env.NEON_DATABASE_URL);
```

### 2. Fail-Safe Defaults
Scripts should have sensible defaults:
```bash
# Default to local if not specified
ENV=${APP_ENV:-local}
```

### 3. Clear Feedback
Scripts should provide clear output:
```bash
echo "📍 Environment: $ENV"
echo "🗄️  Database: $DATABASE_URL"
echo "🌐 API URL: $API_URL"
```

## Important Notes for Claude Agents

### OAuth Requirements
1. **Always use localhost for OAuth** - Google doesn't allow private IPs
2. **Check credentials exist** - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
3. **Use fix-oauth-local.sh** - This handles all OAuth setup

### Database Selection
1. **Local development** - Uses Docker PostgreSQL
2. **Cloud development** - Uses Neon
3. **Auto-detection** - Scripts check DATABASE_URL content

### Common Issues and Solutions

#### Issue: OAuth 500 Error
```bash
# Solution: Use localhost, not IP addresses
./scripts/fix-oauth-local.sh
```

#### Issue: Database Connection Failed
```bash
# Solution: Ensure Docker is running
docker-compose -f docker-compose.local.yml up -d
```

#### Issue: Healthcare Tables Missing
```bash
# Solution: Run healthcare setup
bun run healthcare:setup:local
```

## Quick Reference

### Most Used Commands
```bash
bun run local:healthcare        # Start everything
./scripts/fix-oauth-local.sh    # Fix OAuth issues
bun run db:local:reset         # Reset database
bun run healthcare:setup       # Setup healthcare
```

### Environment Variables to Remember
- `APP_ENV` - Controls database selection
- `EXPO_PUBLIC_API_URL` - API endpoint
- `BETTER_AUTH_BASE_URL` - Auth endpoint (use localhost for OAuth)

### Demo Credentials
- Operator: johncena@gmail.com
- Nurse: doremon@gmail.com
- Doctor: johndoe@gmail.com
- Head Doctor: saipramod273@gmail.com

## Creating New Scripts

When creating new scripts, follow this template:

```bash
#!/bin/bash

# Script description
echo "🚀 Starting [script purpose]..."

# Detect environment
ENV=${APP_ENV:-local}
echo "📍 Environment: $ENV"

# Set database URL based on environment
if [ "$ENV" = "local" ]; then
    export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
else
    export DATABASE_URL=$NEON_DATABASE_URL
fi

# Your script logic here
# ...

# Clear success message
echo "✅ [Script purpose] completed!"
```

This guide should help any Claude agent quickly understand and use the script system effectively.