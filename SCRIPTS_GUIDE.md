# Scripts Guide - Package.json Commands

## 🚀 Quick Start Commands

### Unified Environment System (NEW - Recommended)
```bash
# Unified start commands - Works for all scenarios
bun start               # Network mode - mobile devices via IP
bun start:local         # Local mode - everything on localhost
bun start:oauth         # OAuth mode - optimized for OAuth testing
bun start:tunnel        # Tunnel mode - remote access via Expo

# These commands automatically:
# - Detect environment mode
# - Use OAuth-safe URLs when needed
# - Handle mobile/web differences
# - Start local services if needed
```

### Legacy Primary Development
```bash
# Healthcare-specific commands
bun run local:healthcare    # Start local with healthcare setup
bun run dev:healthcare      # Start dev (Neon) with healthcare
bun run start:healthcare    # Auto-detect environment + healthcare
bun run ios:healthcare      # iOS physical device with auto IP detection

# Standard commands
bun ios                  # Start iOS in Expo Go
bun android              # Start Android in Expo Go
bun web                  # Start web in Expo Go
```

### Environment Modes Explained
```bash
# LOCAL MODE (start:local)
# - Everything on localhost:8081
# - Uses local Docker PostgreSQL
# - Perfect for OAuth testing
# - No network issues

# NETWORK MODE (start) - DEFAULT
# - API on network IP (192.168.x.x)
# - Auth on localhost (OAuth compatibility)
# - Mobile devices can connect
# - Best for device testing

# TUNNEL MODE (start:tunnel)
# - Public URL via Expo tunnel
# - Uses cloud database
# - Share with team/testers
# - Works anywhere

# OAUTH MODE (start:oauth)
# - Optimized for OAuth flows
# - Everything on localhost
# - Ensures OAuth success
# - Profile completion testing
```

### Legacy Environment Commands
```bash
# Local environment (Docker PostgreSQL)
bun run local            # Expo Go with local database
bun run local:healthcare # With healthcare setup
bun run local:tunnel     # Local with tunnel

# Development environment (Neon Cloud)
bun run dev              # Expo Go with Neon database
bun run dev:healthcare   # With healthcare setup
bun run dev:tunnel       # Dev with tunnel
```

### Network Troubleshooting
```bash
bun scripts/check-network.ts        # Check network configuration and test endpoints
bun scripts/test-tunnel-connection.ts # Test Expo tunnel connectivity
bun scripts/verify-tunnel-fixes.ts  # Verify tunnel mode fixes are applied
bun env:update-ip                   # Update IP addresses in environment files
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
bun expo:ios       # iOS in Expo Go app (cloud database)
bun expo:android   # Android in Expo Go app (cloud database)
bun expo:go        # Start for Expo Go (both platforms, cloud database)
bun expo:go:local  # Start Expo Go with local PostgreSQL database
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

### Database Operations (Environment-Aware)
```bash
# Migrations - auto-detect environment
bun db:migrate            # Uses DATABASE_URL
bun db:migrate:local      # Force local database
bun db:migrate:dev        # Force Neon database

# Schema Push
bun db:push               # Uses DATABASE_URL
bun db:push:local         # Force local database
bun db:push:dev           # Force Neon database

# Drizzle Studio (GUI)
bun db:studio             # Uses DATABASE_URL
bun db:studio:local       # Force local database
bun db:studio:dev         # Force Neon database
```

### Healthcare Setup (NEW)
```bash
# Setup healthcare tables and demo data
bun run healthcare:setup       # Uses current environment
bun run healthcare:setup:local # Force local database
bun run healthcare:setup:dev   # Force Neon database

# Combined commands
bun run healthcare:demo        # Alias for healthcare:setup

# iOS Physical Device Healthcare Setup
bun run ios:healthcare         # Auto-detects IP, sets up healthcare, starts WS
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

## 🔍 Setup Verification & Health Checks

### Network Connectivity
```bash
bun scripts/check-network.ts          # Full network diagnostics
bun scripts/fix-mobile-network.ts     # Fix mobile network issues
bun api:health                        # Check API health endpoint
```

### Database Connection
```bash
bun scripts/check-environment.ts      # Verify database connectivity
bun db:studio:local                   # Visual DB verification (local)
bun db:studio:dev                     # Visual DB verification (cloud)
```

### API & Environment Validation
```bash
bun scripts/check-api-health.ts       # Comprehensive API health check
bun scripts/test-api-endpoints.ts     # Test all API endpoints
bun scripts/test-auth-headers.ts      # Verify auth headers
bun env:generate                      # Regenerate environment files
```

### Expo & OAuth Verification
```bash
bun scripts/check-build-environment.ts # Verify build environment
bun scripts/test-oauth-flow.ts        # Test OAuth configuration
bun scripts/check-user-status.ts      # Check user auth status
```

### Platform-Specific Checks
```bash
# iOS Simulator
bun scripts/fix-ios-simulator.sh      # Fix iOS simulator network

# Android Emulator  
bun scripts/setup-ngrok-android.sh    # Setup Android with ngrok

# Web Browser
bun scripts/browser-oauth-test.js     # Test OAuth in browser
```

## 🎯 Quick Setup Audit

### Pre-flight Checklist
Before starting development, run these commands in order:

```bash
# 1. Environment Setup
bun install                           # Install dependencies
bun env:generate                      # Generate env files
bun env:update-ip                     # Update IP addresses

# 2. Database Setup
bun db:local:up                       # Start local PostgreSQL
bun db:migrate:local                  # Run migrations
bun db:studio:local                   # Verify database schema

# 3. API Verification
bun scripts/check-api-health.ts       # Verify API is running
bun scripts/test-api-endpoints.ts     # Test API endpoints

# 4. Platform-Specific Setup
bun scripts/check-network.ts          # Check network config
bun scripts/check-build-environment.ts # Verify build setup
```

### Common Setup Issues & Solutions

#### "No development build" Error
```bash
# Solution 1: Use Expo Go
bun expo:go                           # Cloud database
bun expo:go:local                     # Local database

# Solution 2: Create development build
bun eas:build:ios                     # iOS dev build
bun eas:build:android                 # Android dev build
```

#### Network Connection Issues
```bash
# LAN issues
bun start:tunnel                      # Use tunnel instead

# Multiple networks
bun start:multi-network               # Primary WiFi
bun start:secondary-wifi              # Secondary WiFi

# Tunnel mode issues
bun scripts/test-tunnel-connection.ts # Test tunnel connectivity
# Press 's' in terminal to switch to Expo Go mode
# Use exp://[tunnel-id].exp.direct URL in Expo Go
```

#### Database Connection Failed
```bash
# Check Docker is running
docker ps                             # Should show postgres container

# Restart local database
bun db:local:reset                    # Reset and restart

# Use cloud database instead
bun web:dev                           # Cloud DB for web
bun expo:go                           # Cloud DB for mobile
```

#### OAuth Not Working (UPDATED)
```bash
# For local OAuth testing (NEW - RECOMMENDED)
./scripts/fix-oauth-local.sh          # Fix OAuth with localhost

# This script automatically:
# - Forces localhost URLs (required by Google)
# - Checks database is running
# - Sets up healthcare tables
# - Starts Expo with correct config

# Alternative: Ngrok for stable URL
bun ngrok:start                       # Start ngrok tunnel
bun ngrok:update-eas                  # Update EAS config
bun ngrok:build:android               # Build with ngrok URL

# Verify OAuth config
bun scripts/test-oauth-flow.ts        # Test OAuth flow
bun scripts/test-healthcare-endpoints.ts # Test all endpoints
```

#### Expo Go Tunnel Mode Issues
```bash
# Common tunnel mode errors and fixes:

# 1. "AsyncStorage has been extracted" warning
# This is normal in Expo Go - warning is suppressed automatically

# 2. API calls failing with network errors
bun scripts/test-tunnel-connection.ts # Verify tunnel is working
# Ensure you're in Expo Go mode (press 's' in terminal)

# 3. Authentication not persisting
# This is expected in tunnel mode - tokens are stored differently
# Login will be required each time you reload

# 4. CORS errors on API calls
# The tunnel config automatically handles CORS
# If still failing, restart Expo with: bun start:tunnel --clear

# 5. Reanimated errors on web
# "ProgressTransitionRegister is not available on non-native platform"
# This is handled by the web fix - animations are disabled on web
# Clear cache if still seeing: bun start:tunnel --clear

# 6. Web opens tunnel URL instead of localhost
# When pressing 'w' in tunnel mode, it opens https://[id].exp.direct
# Solution: Manually open http://localhost:8081 in your browser
# Or use: bun web (without tunnel) for local web development

# 7. Google OAuth fails on tunnel URL
# Error: "Failed to load resource: 403"
# Cause: Tunnel URL not in Google OAuth authorized domains
# Solutions:
#   a) Use localhost instead: bun web:open
#   b) Add tunnel URL to Google Console (changes each restart)
#   c) Use ngrok for stable URL: bun ngrok:start
# See: GOOGLE_OAUTH_TUNNEL_SETUP.md for details
```

### Platform-Specific Verification

#### iOS Development
```bash
# Verify iOS setup
bun ios                               # Should open simulator
bun debug:ios                         # Check console logs
bun logs:ios                          # View detailed logs
```

#### Android Development
```bash
# Verify Android setup
bun android                           # Should open emulator
bun debug:android                     # Check console logs
bun logs:android                      # View detailed logs
```

#### Web Development
```bash
# Verify web setup
bun web:local                         # Should open browser
bun api:health                        # Check API endpoint
bun scripts/browser-oauth-test.js     # Test OAuth in browser
```

## 📊 Development Status Dashboard

### Check All Services Status
```bash
# Run comprehensive status check
bun scripts/check-api-health.ts       # API health with details
bun scripts/check-network.ts          # Network configuration
bun scripts/check-environment.ts      # Environment validation
docker ps                             # Docker services status
```

### Monitor Performance Metrics
```bash
# API Performance
bun scripts/test-api-endpoints.ts     # Response time metrics

# Database Performance
bun db:studio:local                   # Query performance monitor

# Build Performance
eas build:list --platform=all         # Build status and times
```

### View Recent Errors
```bash
# Application Logs
bun logs:ios                          # iOS error logs
bun logs:android                      # Android error logs

# API Logs
docker logs my-expo-api -f            # API container logs
docker logs my-expo-postgres -f       # Database logs

# Debug Panel (in-app)
# Enable debug mode in Settings > Developer Options
```

### Test Authentication Flows
```bash
# Email/Password Auth
bun scripts/test-auth-simple.ts       # Basic auth test
bun scripts/test-complete-profile.ts  # Profile completion test

# OAuth Flow
bun scripts/test-oauth-flow.ts        # Full OAuth test
bun scripts/test-oauth-profile-completion.ts # OAuth + profile

# Mobile Auth
bun scripts/test-mobile-auth.ts       # Mobile-specific auth
bun scripts/debug-mobile-auth.ts      # Debug mobile auth issues

# Session Management
bun scripts/check-user-status.ts      # Current session status
bun scripts/test-logout.ts            # Logout functionality
```

### Quick Status Commands
```bash
# One-line status checks
bun api:health && echo "✅ API is healthy" || echo "❌ API is down"
docker ps --format "table {{.Names}}\t{{.Status}}" | grep my-expo
bun scripts/check-network.ts | grep "✅"
```

### Development Build Status
```bash
# Check build availability
eas build:list --platform=ios --limit=1
eas build:list --platform=android --limit=1

# Download latest builds
bun preview:run:ios                   # Install latest iOS
bun preview:run:android               # Install latest Android
```

---

## 🏥 Healthcare Demo Workflows (NEW)

### Quick Start Healthcare Demo
```bash
# Option 1: One command to rule them all
bun run local:healthcare

# Option 2: OAuth-friendly setup
./scripts/fix-oauth-local.sh

# Option 3: Manual steps
bun db:local:up                    # Start database
bun run healthcare:setup:local     # Setup healthcare
bun run local                      # Start Expo
```

## 🔌 WebSocket Real-time Features (NEW)

### WebSocket Configuration
The healthcare demo includes WebSocket support for real-time updates:
- Alert notifications
- Patient vitals monitoring
- System metrics updates

### WebSocket Server Details
When using healthcare scripts, the WebSocket server:
- **Runs on port 3001** by default
- **Starts automatically** with `bun run local:healthcare` or `./scripts/fix-oauth-local.sh`
- **Can be started manually** if needed

### Starting WebSocket Server
```bash
# The WebSocket server should start automatically with healthcare demo
# If it doesn't, you can start it manually:

# Option 1: Standalone WebSocket server (recommended for testing)
node scripts/standalone-websocket.ts

# Option 2: Check WebSocket status
bun run scripts/test-websocket.ts

# WebSocket runs on port 3001 by default
```

### Environment Variables
```bash
# Required WebSocket configuration (already set in .env.local):
EXPO_PUBLIC_ENABLE_WS=true        # Enables WebSocket features
EXPO_PUBLIC_WS_PORT=3001         # WebSocket server port

# These variables control:
# - Whether WebSocket connections are attempted
# - Which port the WebSocket server listens on
# - Real-time subscription features in healthcare blocks
```

### Testing Real-time Features
1. Start healthcare environment: `bun run local:healthcare`
2. Start WebSocket server (if not auto-started): `node scripts/standalone-websocket.ts`
3. Login as operator: `johncena@gmail.com`
4. Open multiple browser tabs/devices
5. Create/update alerts and watch real-time updates

### WebSocket Implementation Details
- **Server**: `/src/server/websocket/server.ts` - tRPC WebSocket adapter
- **Client**: `/lib/trpc/links.tsx` - Split link (HTTP + WebSocket)
- **Store**: `/lib/stores/healthcare-store.ts` - Zustand real-time state
- **Components**: AlertListBlock, PatientCardBlock, MetricsOverviewBlock

### Troubleshooting WebSocket
```bash
# Check if WebSocket server is running
lsof -i :3001

# Test WebSocket connection
bun run scripts/test-websocket.ts

# View WebSocket logs
# Check the terminal where you started the standalone server

# If WebSocket fails, the app falls back to polling (30s intervals)
```

### Healthcare Demo Credentials
```
Operator: johncena@gmail.com (any password)
Nurse: doremon@gmail.com (any password)
Doctor: johndoe@gmail.com (any password)
Head Doctor: saipramod273@gmail.com (any password)
```

### Test Healthcare Features
```bash
# Test all endpoints
bun run scripts/test-healthcare-endpoints.ts

# Check database
bun db:studio:local
# View: alerts, healthcare_users, hospitals tables

# Reset healthcare data
bun db:local:reset
bun run healthcare:setup:local
```

## 📋 Common Workflows

### Start Local Development with Healthcare
```bash
# Recommended approach
bun run local:healthcare

# This single command:
# 1. Starts Docker PostgreSQL
# 2. Sets up healthcare tables
# 3. Creates demo users and alerts
# 4. Starts Expo in correct mode
```

### Fix OAuth Issues
```bash
# OAuth requires localhost (not IP addresses)
./scripts/fix-oauth-local.sh

# Access at: http://localhost:8081
# Click "Continue with Google" to test
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