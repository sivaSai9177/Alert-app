#!/bin/bash

# Docker Setup Script for My-Expo Project
# This script sets up the complete Docker environment

set -e

echo "🐳 My-Expo Docker Setup"
echo "======================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print colored output
print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# Check prerequisites
echo "Checking prerequisites..."

if ! command_exists docker; then
    print_error "Docker is not installed. Please install Docker Desktop for Mac."
    exit 1
else
    print_status "Docker is installed"
fi

if ! command_exists docker-compose; then
    print_error "Docker Compose is not installed. Please install Docker Desktop for Mac."
    exit 1
else
    print_status "Docker Compose is installed"
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker Desktop."
    exit 1
else
    print_status "Docker is running"
fi

# Create necessary directories
echo -e "\nCreating directories..."
mkdir -p logs/{manager,backend,frontend,tester,hub}
mkdir -p test-results
mkdir -p scripts/agents
mkdir -p scripts/agent-hub
print_status "Directories created"

# Create .env.docker if it doesn't exist
if [ ! -f .env.docker ]; then
    echo -e "\nCreating .env.docker file..."
    cat > .env.docker << 'EOF'
# Database
POSTGRES_USER=myexpo
POSTGRES_PASSWORD=myexpo123
POSTGRES_DB=myexpo_dev
POSTGRES_TEST_DB=myexpo_test
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
BETTER_AUTH_SECRET=dev-secret-change-in-production
BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (update with your credentials)
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here

# pgAdmin
PGADMIN_EMAIL=admin@myexpo.com
PGADMIN_PASSWORD=admin123
PGADMIN_PORT=5050

# MailHog
MAILHOG_SMTP_PORT=1025
MAILHOG_UI_PORT=8025
EOF
    print_status ".env.docker created (please update OAuth credentials)"
else
    print_status ".env.docker already exists"
fi

# Create docker network
echo -e "\nCreating Docker network..."
if ! docker network inspect myexpo-network >/dev/null 2>&1; then
    docker network create myexpo-network
    print_status "Docker network created"
else
    print_status "Docker network already exists"
fi

# Build images
echo -e "\nBuilding Docker images..."
docker-compose build --no-cache
print_status "Docker images built"

# Start core services
echo -e "\nStarting core services..."
docker-compose up -d postgres redis
print_status "PostgreSQL and Redis started"

# Wait for PostgreSQL to be ready
echo -e "\nWaiting for PostgreSQL to be ready..."
until docker-compose exec postgres pg_isready -U myexpo >/dev/null 2>&1; do
    echo -n "."
    sleep 1
done
echo ""
print_status "PostgreSQL is ready"

# Run database migrations
echo -e "\nRunning database migrations..."
if docker-compose run --rm api bun run db:generate && docker-compose run --rm api bun run db:migrate; then
    print_status "Database migrations completed"
else
    print_warning "Database migrations failed - you may need to run them manually"
fi

# Start all development services
echo -e "\nStarting development services..."
docker-compose --profile development up -d
print_status "Development services started"

# Display service URLs
echo -e "\n🎉 Docker setup complete!"
echo -e "\nService URLs:"
echo "  • API Server:    http://localhost:3000"
echo "  • Expo Dev:      http://localhost:8081"
echo "  • PostgreSQL:    localhost:5432"
echo "  • Redis:         localhost:6379"

echo -e "\nOptional services (start with --profile tools):"
echo "  • pgAdmin:       http://localhost:5050"
echo "  • MailHog:       http://localhost:8025"

echo -e "\nUseful commands:"
echo "  • View logs:     docker-compose logs -f [service]"
echo "  • Stop all:      docker-compose down"
echo "  • Reset all:     docker-compose down -v"
echo "  • Shell access:  docker-compose exec api sh"

echo -e "\nNext steps:"
echo "  1. Update OAuth credentials in .env.docker"
echo "  2. Run 'docker-compose logs -f' to view logs"
echo "  3. Open http://localhost:8081 for Expo"

# Check if user wants to start optional tools
echo -e "\nWould you like to start optional tools (pgAdmin, MailHog)? (y/n)"
read -r response
if [[ "$response" =~ ^[Yy]$ ]]; then
    docker-compose --profile tools up -d
    print_status "Optional tools started"
fi

echo -e "\n✨ Happy coding with Docker!"