#!/bin/bash

# Unified Start Script - Works for all scenarios
# Usage: ./scripts/start-unified.sh [mode]
# Modes: local, network, tunnel, oauth

MODE=${1:-network}  # Default to network mode

echo "🚀 Starting in $MODE mode..."
echo "================================"
echo ""

# Function to detect local IP
get_local_ip() {
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "localhost"
    else
        # Linux
        hostname -I | awk '{print $1}' || echo "localhost"
    fi
}

# Function to check if local services are running
check_local_services() {
    if ! docker ps | grep -q "myexpo-postgres-local"; then
        echo "⚠️  Local PostgreSQL is not running!"
        echo "Starting local database services..."
        docker-compose -f docker-compose.local.yml up -d postgres-local redis-local
        sleep 3
    fi
    echo "✅ Local services running"
}

# Function to setup healthcare
setup_healthcare() {
    echo "Checking healthcare setup..."
    if ! docker exec myexpo-postgres-local psql -U myexpo -d myexpo_dev -c "SELECT 1 FROM alerts LIMIT 1;" &>/dev/null; then
        echo "⚠️  Healthcare tables not found. Setting up..."
        APP_ENV=local DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev" bun run scripts/setup-healthcare-local.ts
        echo "✅ Healthcare setup complete!"
    else
        echo "✅ Healthcare tables already exist"
    fi
}

# Load base environment
if [ -f .env ]; then
    # Load Google OAuth credentials
    export GOOGLE_CLIENT_ID=$(grep '^GOOGLE_CLIENT_ID=' .env | cut -d '=' -f2)
    export GOOGLE_CLIENT_SECRET=$(grep '^GOOGLE_CLIENT_SECRET=' .env | cut -d '=' -f2)
    export BETTER_AUTH_SECRET=$(grep '^BETTER_AUTH_SECRET=' .env | cut -d '=' -f2)
fi

case $MODE in
    "local")
        echo "📍 LOCAL MODE - Using localhost for everything"
        check_local_services
        setup_healthcare
        
        export APP_ENV=local
        export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
        export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"
        export BETTER_AUTH_URL="http://localhost:8081"
        export EXPO_PUBLIC_API_URL="http://localhost:8081"
        
        echo "🌐 Access at: http://localhost:8081"
        exec npx expo start --host localhost --clear
        ;;
        
    "network")
        echo "📍 NETWORK MODE - Using local IP for mobile devices"
        check_local_services
        setup_healthcare
        
        LOCAL_IP=$(get_local_ip)
        echo "🌐 Local IP: $LOCAL_IP"
        
        export APP_ENV=local
        export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
        export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"  # OAuth still uses localhost
        export BETTER_AUTH_URL="http://localhost:8081"
        export EXPO_PUBLIC_API_URL="http://$LOCAL_IP:8081"
        
        echo "🌐 Web access: http://localhost:8081"
        echo "📱 Mobile access: http://$LOCAL_IP:8081"
        exec npx expo start --host lan --clear
        ;;
        
    "tunnel")
        echo "📍 TUNNEL MODE - Using Expo tunnel for remote access"
        # Use cloud database for tunnel mode
        export APP_ENV=development
        export DATABASE_URL=$NEON_DATABASE_URL
        
        echo "☁️  Using cloud database"
        exec npx expo start --tunnel --clear
        ;;
        
    "oauth")
        echo "📍 OAUTH MODE - Optimized for OAuth testing"
        check_local_services
        setup_healthcare
        
        export APP_ENV=local
        export DATABASE_URL="postgresql://myexpo:myexpo123@localhost:5432/myexpo_dev"
        export BETTER_AUTH_BASE_URL="http://localhost:8081/api/auth"
        export BETTER_AUTH_URL="http://localhost:8081"
        export EXPO_PUBLIC_API_URL="http://localhost:8081"
        
        echo "🔐 OAuth configured for localhost"
        echo "🌐 Access at: http://localhost:8081"
        exec npx expo start --host localhost --clear
        ;;
        
    *)
        echo "❌ Unknown mode: $MODE"
        echo "Available modes: local, network, tunnel, oauth"
        exit 1
        ;;
esac