#!/bin/bash

# Install dependencies for all services
echo "📦 Installing dependencies for all LMS microservices..."

services=("api-gateway" "auth-service" "user-service" "course-service" "content-service" "assessment-service" "report-service")

for service in "${services[@]}"
do
    echo ""
    echo "Installing dependencies for $service..."
    cd $service
    npm install
    cd ..
    echo "✅ $service dependencies installed"
done

echo ""
echo "🎉 All dependencies installed successfully!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env in each service directory"
echo "2. Configure environment variables"
echo "3. Start MongoDB"
echo "4. Run ./start-all.sh to start all services"
