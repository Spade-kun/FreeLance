#!/bin/bash

# Start all LMS microservices in background
echo "🚀 Starting LMS Microservices..."
echo ""

# Array of services
declare -a services=(
    "api-gateway:1001"
    "auth-service:1002"
    "user-service:1003"
    "course-service:1004"
    "content-service:1005"
    "assessment-service:1006"
    "report-service:1007"
    "email-service:1008"
    "payment-service:1009"
    "logs-service:1010"
)

# Function to start a service in background
start_service() {
    local service_name=$1
    local port=$2
    
    cd "$service_name"
    
    # Start the service in background and redirect output to log file
    npm run dev > "../logs/${service_name}.log" 2>&1 &
    local pid=$!
    
    # Save PID to file
    echo $pid > "../logs/${service_name}.pid"
    
    cd ..
    
    echo "✅ $service_name started on port $port (PID: $pid)"
}

# Create logs directory if it doesn't exist
mkdir -p logs

# Stop any existing services
if [ -f "logs/*.pid" ]; then
    echo "🛑 Stopping existing services..."
    for pidfile in logs/*.pid; do
        if [ -f "$pidfile" ]; then
            pid=$(cat "$pidfile")
            if ps -p $pid > /dev/null 2>&1; then
                kill $pid 2>/dev/null
            fi
            rm "$pidfile"
        fi
    done
    echo ""
fi

# Start all services
for service_info in "${services[@]}"; do
    IFS=':' read -r service_name port <<< "$service_info"
    start_service "$service_name" "$port"
    sleep 1
done

echo ""
echo "✅ All services started!"
echo ""
echo "📊 Service Status:"
echo "  API Gateway:        http://localhost:1001"
echo "  Auth Service:       http://localhost:1002"
echo "  User Service:       http://localhost:1003"
echo "  Course Service:     http://localhost:1004"
echo "  Content Service:    http://localhost:1005"
echo "  Assessment Service: http://localhost:1006"
echo "  Report Service:     http://localhost:1007"
echo "  Email Service:      http://localhost:1008"
echo ""
echo "📝 Logs are in: ./logs/"
echo ""
echo "🔍 Check service status:"
echo "  ./check-services.sh"
echo ""
echo "🛑 Stop all services:"
echo "  ./stop-all.sh"
echo ""

# Wait a moment for services to start
sleep 3

# Check if services are responding
echo "🧪 Testing services..."
for service_info in "${services[@]}"; do
    IFS=':' read -r service_name port <<< "$service_info"
    
    if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
        echo "  ✅ Port $port is responding"
    else
        echo "  ⏳ Port $port is starting..."
    fi
done

echo ""
echo "✨ All done! Services are running in background."
echo "   View logs: tail -f logs/<service-name>.log"
echo ""
