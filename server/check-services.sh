#!/bin/bash

# Check status of all LMS microservices
echo "🔍 Checking LMS Microservices Status..."
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
)

running_count=0
stopped_count=0

for service_info in "${services[@]}"; do
    IFS=':' read -r service_name port <<< "$service_info"
    
    # Check if PID file exists
    if [ -f "logs/${service_name}.pid" ]; then
        pid=$(cat "logs/${service_name}.pid")
        
        # Check if process is running
        if ps -p $pid > /dev/null 2>&1; then
            # Check if port is responding
            if curl -s "http://localhost:$port/health" > /dev/null 2>&1; then
                echo "✅ $service_name is running on port $port (PID: $pid)"
                running_count=$((running_count + 1))
            else
                echo "⏳ $service_name is starting on port $port (PID: $pid)"
                running_count=$((running_count + 1))
            fi
        else
            echo "❌ $service_name is not running (stale PID: $pid)"
            stopped_count=$((stopped_count + 1))
        fi
    else
        echo "❌ $service_name is not running"
        stopped_count=$((stopped_count + 1))
    fi
done

echo ""
echo "📊 Summary: $running_count running, $stopped_count stopped"
echo ""

if [ $running_count -eq 9 ]; then
    echo "✅ All services are running!"
    echo ""
    echo "🌐 API Gateway: http://localhost:1001/api"
    echo "📖 API Documentation: See API_DOCUMENTATION.md"
    echo "📝 View logs: tail -f logs/<service-name>.log"
elif [ $running_count -gt 0 ]; then
    echo "⚠️  Some services are not running. Start them with: ./start-all.sh"
else
    echo "❌ No services are running. Start them with: ./start-all.sh"
fi
echo ""
