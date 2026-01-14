#!/bin/bash

# Database Reset Script
# This script resets the database for a fresh start

echo "🔄 Database Reset Script"
echo "========================"

# Function to reset local database
reset_local_db() {
    echo "📦 Resetting local Docker database..."
    
    # Stop and remove containers
    docker-compose -f docker-compose.local.yml down -v
    
    # Start fresh containers
    docker-compose -f docker-compose.local.yml up -d postgres-local redis-local
    
    # Wait for database to be ready
    echo "⏳ Waiting for database to be ready..."
    sleep 5
    
    # Run migrations
    echo "🔨 Running migrations..."
    APP_ENV=local bun drizzle-kit push
    
    echo "✅ Local database reset complete!"
}

# Function to reset cloud database (be careful!)
reset_cloud_db() {
    echo "☁️  Resetting cloud database..."
    echo "⚠️  WARNING: This will delete all data in the cloud database!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]
    then
        # Drop and recreate schema
        echo "🔨 Running migrations..."
        APP_ENV=development bun drizzle-kit push
        echo "✅ Cloud database reset complete!"
    else
        echo "❌ Cloud database reset cancelled"
    fi
}

# Main menu
echo "Select database to reset:"
echo "1) Local (Docker)"
echo "2) Development (Neon Cloud)"
echo "3) Both"
echo "4) Cancel"

read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        reset_local_db
        ;;
    2)
        reset_cloud_db
        ;;
    3)
        reset_local_db
        echo ""
        reset_cloud_db
        ;;
    4)
        echo "❌ Reset cancelled"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Database reset process complete!"
echo "You can now run 'bun start' or 'bun local' to start the app"