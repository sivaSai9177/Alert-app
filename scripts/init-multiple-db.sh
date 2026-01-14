#!/bin/bash
# Script to create multiple databases in PostgreSQL container

set -e
set -u

function create_database() {
    local database=$1
    echo "Checking database '$database'"
    
    # Check if database exists
    if psql -U "$POSTGRES_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$database'" | grep -q 1; then
        echo "Database '$database' already exists, skipping creation"
    else
        echo "Creating database '$database'"
        psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-EOSQL
            CREATE DATABASE $database;
            GRANT ALL PRIVILEGES ON DATABASE $database TO $POSTGRES_USER;
EOSQL
        echo "Database '$database' created successfully"
    fi
}

if [ -n "$POSTGRES_MULTIPLE_DATABASES" ]; then
    echo "Multiple database creation requested: $POSTGRES_MULTIPLE_DATABASES"
    for db in $(echo $POSTGRES_MULTIPLE_DATABASES | tr ',' ' '); do
        create_database $db
    done
    echo "Multiple databases created successfully"
fi