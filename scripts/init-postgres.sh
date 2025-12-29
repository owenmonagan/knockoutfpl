#!/bin/bash
# scripts/init-postgres.sh

# Wait for PostgreSQL to be ready
until pg_isready -h localhost -U postgres; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "PostgreSQL is ready!"

# Create database if it doesn't exist
psql -h localhost -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = 'knockoutfpl_dev'" | grep -q 1 || \
  psql -h localhost -U postgres -c "CREATE DATABASE knockoutfpl_dev"

echo "Database knockoutfpl_dev ready!"
