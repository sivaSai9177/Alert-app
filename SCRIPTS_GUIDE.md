# Scripts Guide - Package.json Commands

## 🚀 Quick Start Commands

### Primary Development
```bash
bun start          # Start Expo (all platforms)
bun ios           # Start iOS development
bun android       # Start Android development  
bun web           # Start web development
```

### Web Development with Database Selection
```bash
bun web:local     # Web with local PostgreSQL (myexpo_dev)
bun web:preview   # Web with preview PostgreSQL (myexpo_preview)
bun web:dev       # Web with Neon cloud database
bun web:ngrok     # Web with ngrok URL (for OAuth testing)
```

## 📱 Mobile Development (Expo Go)

```bash
bun expo:ios      # iOS in Expo Go app
bun expo:android  # Android in Expo Go app
bun expo:go       # Start for Expo Go (both platforms)
```

## 🌍 Environment-Specific Development

```bash
bun dev:local       # Local environment
bun dev:preview     # Preview environment
bun dev:development # Development environment
bun dev:staging     # Staging environment
bun dev:production  # Production environment
```

## 🗄️ Database Management

### Local Database Docker
```bash
bun db:local:up    # Start local PostgreSQL & Redis
bun db:local:down  # Stop local services
bun db:local:reset # Reset and restart local DB
```

### Database Migrations
```bash
bun db:migrate:local   # Migrate local database
bun db:migrate:preview # Migrate preview database
bun db:migrate:dev     # Migrate development database
```

### Database Schema Push
```bash
bun db:push:local   # Push schema to local DB
bun db:push:preview # Push schema to preview DB
bun db:push:dev     # Push schema to development DB
```

### Database Studio (GUI)
```bash
bun db:studio:local   # Open Drizzle Studio for local DB
bun db:studio:preview # Open Drizzle Studio for preview DB
bun db:studio:dev     # Open Drizzle Studio for dev DB
```

## 🏗️ EAS Build Commands

### Setup & Build
```bash
bun eas:setup         # Initial EAS setup
bun eas:build:ios     # Build iOS development
bun eas:build:android # Build Android development
```

### Preview Builds
```bash
bun preview           # Interactive preview build
bun preview:quick     # Quick iOS preview build
bun preview:ios       # iOS preview build
bun preview:android   # Android preview build
```

### Run Preview Builds
```bash
bun preview:run:ios     # Run latest iOS build
bun preview:run:android # Run latest Android build
```

## 🌐 Ngrok Tunneling

```bash
bun ngrok:setup        # Setup ngrok
bun ngrok:start        # Start ngrok tunnel
bun ngrok:update-eas   # Update EAS config with ngrok URL
bun ngrok:build:ios    # Build iOS with ngrok
bun ngrok:build:android # Build Android with ngrok
```

## ⚙️ Environment Configuration

```bash
bun setup:env                # Setup environment
bun env:generate             # Generate env files
bun env:generate:local       # Generate local env
bun env:generate:ngrok       # Generate ngrok env
bun env:generate:production  # Generate production env
bun env:update-ip           # Update local IP address
```

## 🧪 Testing

```bash
bun test          # Run tests
bun test:watch    # Run tests in watch mode
bun test:coverage # Run tests with coverage
bun api:test      # Test API endpoints
bun api:health    # Check API health
```

## 🐛 Debugging & Logs

```bash
bun debug:ios      # Debug iOS with Expo Go
bun debug:android  # Debug Android with Expo Go
bun logs:ios       # View iOS logs
bun logs:android   # View Android logs
```

## 🔧 Utilities & Maintenance

```bash
bun lint           # Run linter
bun reset-project  # Reset project
bun reset-profile  # Reset user profile completion
bun delete-user    # Delete test user
```

---

## 📋 Common Workflows

### Start Local Development with Local DB
```bash
# 1. Start local database
bun db:local:up

# 2. Run web with local database
bun web:local
```

### Test OAuth with Ngrok
```bash
# 1. Start ngrok
bun ngrok:start

# 2. Update EAS config
bun ngrok:update-eas

# 3. Build for testing
bun ngrok:build:ios
```

### Switch Between Databases
```bash
# Local database
bun web:local

# Preview database  
bun web:preview

# Cloud database (Neon)
bun web:dev
```