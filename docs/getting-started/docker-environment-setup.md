# 🐳 Docker Environment Setup Guide

*Version: 1.0.0 | Last Updated: June 6, 2025*

## 📋 Overview

This guide provides step-by-step instructions for setting up the Docker-based development environment for the My-Expo project.

## 🚀 Prerequisites

### System Requirements
- **macOS**: 10.15 or later
- **RAM**: 8GB minimum (16GB recommended)
- **Storage**: 20GB free space
- **CPU**: 4+ cores recommended

### Software Requirements
1. **Docker Desktop for Mac**
   - Download from [docker.com](https://www.docker.com/products/docker-desktop/)
   - Version 4.0 or later
   - Ensure virtualization is enabled

2. **Git**
   - Pre-installed on macOS
   - Verify with `git --version`

3. **Code Editor**
   - VS Code recommended
   - Install Docker extension for VS Code

## 🛠️ Installation Steps

### Step 1: Install Docker Desktop
```bash
# Download Docker Desktop for Mac
# https://www.docker.com/products/docker-desktop/

# After installation, verify
docker --version
docker-compose --version
```

### Step 2: Configure Docker Desktop
1. Open Docker Desktop
2. Go to Settings → Resources
3. Configure:
   - **Memory**: 8GB (minimum 4GB)
   - **CPUs**: 4 (minimum 2)
   - **Disk image size**: 60GB
4. Apply & Restart

### Step 3: Clone the Repository
```bash
# Clone the project
git clone <repository-url>
cd my-expo

# Checkout the correct branch
git checkout hospital-mvp
```

### Step 4: Run Setup Script
```bash
# Make setup script executable
chmod +x scripts/docker-setup.sh

# Run the setup
./scripts/docker-setup.sh
```

This script will:
- Check prerequisites
- Create necessary directories
- Generate `.env.docker` file
- Build Docker images
- Start services
- Run database migrations

### Step 5: Configure Environment
Edit `.env.docker` with your credentials:
```env
# Update these values
GOOGLE_CLIENT_ID=your-actual-client-id
GOOGLE_CLIENT_SECRET=your-actual-client-secret
BETTER_AUTH_SECRET=generate-a-secure-secret

# Optional: Change database credentials
POSTGRES_PASSWORD=choose-a-strong-password
```

## 🔧 Service Management

### Starting Services
```bash
# Start all development services
docker-compose --profile development up

# Start in background
docker-compose --profile development up -d

# Start specific services
docker-compose up postgres redis api
```

### Stopping Services
```bash
# Stop all services
docker-compose down

# Stop and remove volumes (data)
docker-compose down -v
```

### Viewing Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f expo
```

## 📱 Expo Development

### For iOS Simulator
```bash
# Ensure Expo service is running
docker-compose up expo

# In another terminal
open -a Simulator
# Then press 'i' in the Expo terminal
```

### For Android Emulator
```bash
# Ensure Expo service is running
docker-compose up expo

# In another terminal
emulator -avd <your-avd-name>
# Then press 'a' in the Expo terminal
```

### For Physical Device
1. Update `.env.docker`:
   ```env
   REACT_NATIVE_PACKAGER_HOSTNAME=<your-mac-ip-address>
   ```

2. Find your IP:
   ```bash
   ifconfig | grep "inet " | grep -v 127.0.0.1
   ```

3. Restart Expo service:
   ```bash
   docker-compose restart expo
   ```

4. Scan QR code with Expo Go app

## 🗄️ Database Management

### Accessing PostgreSQL
```bash
# Direct access
docker-compose exec postgres psql -U myexpo -d myexpo_dev

# Using pgAdmin (if started with --profile tools)
open http://localhost:5050
# Login: admin@myexpo.com / admin123
```

### Running Migrations
```bash
# Generate migration
docker-compose exec api bun run db:generate

# Run migrations
docker-compose exec api bun run db:migrate

# Open Drizzle Studio
docker-compose exec api bun run db:studio
```

## 🧪 Testing

### Running Tests
```bash
# Run all tests
docker-compose -f docker-compose.test.yml run test-runner

# Run specific test
docker-compose -f docker-compose.test.yml run test-runner bun test auth.test.ts

# Run with coverage
docker-compose -f docker-compose.test.yml run test-runner bun test --coverage
```

### E2E Testing
```bash
# Run E2E tests
docker-compose -f docker-compose.test.yml --profile e2e up

# Run specific E2E test
docker-compose -f docker-compose.test.yml run e2e-runner bunx playwright test login.spec.ts
```

## 🤖 Multi-Agent System

### Starting Agents
```bash
# Start all agents
docker-compose -f docker-compose.agents.yml --profile agents up

# Start specific agent
docker-compose -f docker-compose.agents.yml up manager-agent
```

### Using Agents
```bash
# Process a PRD
docker-compose -f docker-compose.agents.yml exec manager-agent \
  bun run process-prd /workspace/docs/projects/my-app/PRD.md

# Check agent status
docker-compose -f docker-compose.agents.yml ps
```

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find what's using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use different ports in .env.docker
API_PORT=3001
```

#### Database Connection Failed
```bash
# Check if PostgreSQL is running
docker-compose ps postgres

# Check logs
docker-compose logs postgres

# Recreate database
docker-compose down -v postgres
docker-compose up postgres
```

#### Expo Not Connecting
```bash
# For "Network response timed out"
# Update REACT_NATIVE_PACKAGER_HOSTNAME in .env.docker

# Restart Expo
docker-compose restart expo

# Clear Expo cache
docker-compose exec expo npx expo start -c
```

#### Permission Errors
```bash
# Fix node_modules permissions
docker-compose exec expo chown -R node:node /app/node_modules

# Fix general permissions
sudo chown -R $USER:$USER .
```

## 📊 Performance Tips

### 1. Docker Desktop Settings
- Enable "Use the new Virtualization framework"
- Enable "VirtioFS" for better performance

### 2. Resource Monitoring
```bash
# Monitor container resources
docker stats

# Check disk usage
docker system df
```

### 3. Cleanup Commands
```bash
# Remove unused containers
docker container prune

# Remove unused images
docker image prune -a

# Full cleanup (careful!)
docker system prune -a --volumes
```

## 🔄 Daily Workflow

### Morning Setup
```bash
# 1. Start Docker Desktop
# 2. Start services
docker-compose --profile development up -d

# 3. Check service health
docker-compose ps

# 4. View logs if needed
docker-compose logs -f api
```

### During Development
```bash
# Execute commands in containers
docker-compose exec api bun install <package>
docker-compose exec api bun run db:studio

# Restart services after changes
docker-compose restart api
```

### End of Day
```bash
# Stop services (preserves data)
docker-compose down

# Or keep running for next day
docker-compose logs > logs/docker-$(date +%Y%m%d).log
```

## 🚀 Next Steps

1. **Verify Installation**
   - All services running: `docker-compose ps`
   - API accessible: `curl http://localhost:3000/api/health`
   - Expo running: `open http://localhost:8081`

2. **Configure OAuth**
   - Set up Google OAuth credentials
   - Update `.env.docker`
   - Restart API service

3. **Start Development**
   - Create your first PRD
   - Use the multi-agent system
   - Build your application!

## 📚 Additional Resources

- [Docker Compose CLI Reference](https://docs.docker.com/compose/reference/)
- [Debugging Docker Containers](https://docs.docker.com/config/containers/logging/)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)

---

*For issues or questions, check the troubleshooting section or create an issue in the repository.*