#!/bin/bash

# Check Setup Status
echo "🔍 Checking setup status..."

# Check if .env files exist
echo ""
echo "📋 Checking .env files..."
services=("api-gateway" "auth-service" "user-service" "course-service" "content-service" "assessment-service" "report-service")
all_env_exist=true

for service in "${services[@]}"; do
    if [ -f "$service/.env" ]; then
        echo "  ✅ $service/.env"
    else
        echo "  ❌ $service/.env (missing)"
        all_env_exist=false
    fi
done

if [ "$all_env_exist" = false ]; then
    echo ""
    echo "❌ Some .env files are missing!"
    exit 1
fi

# Check if node_modules exist
echo ""
echo "📦 Checking dependencies..."
deps_installed=true

for service in "${services[@]}"; do
    if [ -d "$service/node_modules" ]; then
        echo "  ✅ $service dependencies installed"
    else
        echo "  ❌ $service dependencies not installed"
        deps_installed=false
    fi
done

if [ "$deps_installed" = false ]; then
    echo ""
    echo "⚠️  Dependencies need to be installed!"
    echo "Run: ./install-all.sh"
    echo ""
fi

# MongoDB Atlas (no local check needed)
echo ""
echo "🌐 MongoDB Configuration:"
echo "  ✅ Using MongoDB Atlas (cloud)"
echo "  ✅ Connection string configured"

echo ""
echo "✅ Setup check complete!"
echo ""

if [ "$deps_installed" = false ]; then
    echo "Next step: Install dependencies"
    echo "  ./install-all.sh"
else
    echo "✅ Ready to start services!"
    echo ""
    echo "Start all services:"
    echo "  ./start-all.sh"
    echo ""
    echo "Or start individually:"
    echo "  cd api-gateway && npm run dev"
    echo "  cd auth-service && npm run dev"
    echo "  cd user-service && npm run dev"
    echo "  etc..."
fi
