# Scripts Guide - Industry Standards Edition

## 📋 Overview

This guide follows modern JavaScript/TypeScript project conventions and industry best practices for script organization.

## 🎯 Primary Commands (Industry Standard)

### Core Development Commands
```bash
# Development
bun dev              # Start development server (default environment)
bun dev:local        # Start with local database
bun dev:staging      # Start with staging environment

# Building
bun build            # Production build
bun build:preview    # Preview build
bun build:ios        # iOS build
bun build:android    # Android build

# Testing
bun test             # Run all tests
bun test:unit        # Unit tests only
bun test:integration # Integration tests
bun test:e2e         # End-to-end tests
bun test:watch       # Watch mode

# Code Quality
bun lint             # Run ESLint
bun lint:fix         # Fix linting issues
bun format           # Format code with Prettier
bun typecheck        # TypeScript type checking

# Database
bun db:migrate       # Run migrations
bun db:seed          # Seed database
bun db:reset         # Reset database
bun db:studio        # Open database GUI
```

### 📱 Platform-Specific Commands
```bash
# iOS Development
bun ios              # Start iOS simulator
bun ios:device       # Start for physical iOS device
bun ios:diagnose     # Diagnose iOS connectivity

# Android Development
bun android          # Start Android emulator
bun android:device   # Start for physical Android device

# Web Development
bun web              # Start web version
```

### 🚀 Deployment & CI/CD
```bash
# Production
bun start            # Start production server
bun preview          # Preview production build

# Deployment
bun deploy           # Deploy to production
bun deploy:staging   # Deploy to staging

# CI/CD
bun ci               # Run all CI checks
bun ci:lint          # CI linting
bun ci:test          # CI testing
bun ci:build         # CI build validation
```

## 🔧 Environment-Based Commands

### Development Environments
```bash
# Local Development (Docker PostgreSQL)
bun dev:local        # Uses local database
bun start:local      # Production mode with local DB

# Cloud Development (Neon Database)
bun dev:cloud        # Uses cloud database
bun start:cloud      # Production mode with cloud DB

# Staging Environment
bun dev:staging      # Staging configuration
bun start:staging    # Production mode staging

# Production Environment
bun start:production # Full production mode
```

### Environment Variables
- `NODE_ENV`: development | production | test
- `APP_ENV`: local | development | staging | production
- Automatically loaded from `.env.[environment].local` files

## 🏥 Project-Specific Commands

### Healthcare MVP
```bash
bun healthcare       # Start with healthcare setup
bun healthcare:setup # Setup healthcare database
bun healthcare:demo  # Load demo data
```

### Authentication
```bash
bun auth:setup       # Setup authentication
bun auth:test        # Test auth endpoints
```

## 📦 Package Management

```bash
# Dependencies
bun install          # Install dependencies
bun add [package]    # Add new dependency
bun remove [package] # Remove dependency
bun update           # Update dependencies

# Scripts
bun run              # List all available scripts
```

## 🛠️ Utility Commands

### Code Generation
```bash
bun generate         # Run code generators
bun generate:types   # Generate TypeScript types
bun generate:api     # Generate API client
```

### Maintenance
```bash
bun clean            # Clean build artifacts
bun clean:cache      # Clear all caches
bun clean:modules    # Remove node_modules
```

### Documentation
```bash
bun docs             # Generate documentation
bun docs:serve       # Serve documentation locally
```

## 🔍 Debugging Commands

```bash
bun debug            # Start with debugging enabled
bun debug:server     # Debug server only
bun debug:client     # Debug client only
bun logs             # Show application logs
```

## 🎨 Script Naming Conventions

1. **Primary action**: `dev`, `build`, `test`, `lint`
2. **Environment suffix**: `:local`, `:staging`, `:production`
3. **Platform suffix**: `:ios`, `:android`, `:web`
4. **Mode suffix**: `:watch`, `:fix`, `:debug`

### Examples:
- `dev:local` - Development with local environment
- `build:ios` - Build for iOS platform
- `test:watch` - Run tests in watch mode
- `lint:fix` - Lint and fix issues

## 🔄 Migration from Old Scripts

| Old Command | New Command | Notes |
|-------------|-------------|-------|
| `bun run local:healthcare` | `bun healthcare` | Simplified |
| `bun run start:tunnel` | `bun dev:tunnel` | Follows convention |
| `bun run expo:go` | `bun dev` | Default is Expo Go |
| `bun run db:local:up` | `bun db:start` | Clearer naming |

## 📝 Creating New Scripts

When adding new scripts, follow these patterns:

```json
{
  "scripts": {
    // Primary action
    "deploy": "bun run deploy:production",
    
    // Environment variants
    "deploy:local": "APP_ENV=local bun run _deploy",
    "deploy:staging": "APP_ENV=staging bun run _deploy",
    "deploy:production": "APP_ENV=production bun run _deploy",
    
    // Internal script (prefixed with _)
    "_deploy": "node scripts/deploy.js"
  }
}
```

## 🚨 Best Practices

1. **Use `bun` instead of `npm run`** for better performance
2. **Environment-specific config** should use `.env.[environment]` files
3. **Parallel tasks** use `concurrently` package
4. **Long-running tasks** should have progress indicators
5. **Destructive operations** should have confirmation prompts
6. **CI scripts** should exit with proper codes (0 for success, 1 for failure)

## 🔗 Related Tools

- **concurrently**: Run multiple scripts in parallel
- **cross-env**: Cross-platform environment variables
- **husky**: Git hooks management
- **lint-staged**: Run linters on staged files
- **prettier**: Code formatting
- **eslint**: Code linting

## 📚 Further Reading

- [npm scripts documentation](https://docs.npmjs.com/cli/v8/using-npm/scripts)
- [Bun documentation](https://bun.sh/docs)
- [Node.js best practices](https://github.com/goldbergyoni/nodebestpractices)