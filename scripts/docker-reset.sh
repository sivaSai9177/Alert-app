#!/bin/bash

# Docker Reset Script
# Completely resets the Docker environment

set -e

echo "🔄 Docker Environment Reset"
echo "=========================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_warning() {
    echo -e "${YELLOW}⚠${NC}  $1"
}

print_status() {
    echo -e "${GREEN}✓${NC} $1"
}

# Warning
print_warning "This will delete all Docker containers, volumes, and data!"
echo "Are you sure you want to continue? (yes/no)"
read -r response

if [[ "$response" != "yes" ]]; then
    echo "Reset cancelled."
    exit 0
fi

echo -e "\nStopping all services..."
docker-compose down
docker-compose -f docker-compose.agents.yml down
docker-compose -f docker-compose.test.yml down
print_status "All services stopped"

echo -e "\nRemoving volumes..."
docker-compose down -v
docker-compose -f docker-compose.test.yml down -v
print_status "Volumes removed"

echo -e "\nRemoving Docker network..."
docker network rm myexpo-network 2>/dev/null || true
docker network rm myexpo-test-network 2>/dev/null || true
print_status "Networks removed"

echo -e "\nCleaning up directories..."
rm -rf logs/*
rm -rf test-results/*
rm -rf coverage/*
print_status "Directories cleaned"

echo -e "\nPruning Docker system..."
docker system prune -f
print_status "Docker system pruned"

echo -e "\n✅ Docker environment has been reset!"
echo -e "\nTo set up again, run:"
echo "  ./scripts/docker-setup.sh"