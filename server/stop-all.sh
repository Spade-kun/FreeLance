#!/bin/bash

# Stop all LMS microservices
echo "🛑 Stopping LMS Microservices..."
echo ""

# Check if logs directory exists
if [ ! -d "logs" ]; then
    echo "⚠️  No running services found."
    exit 0
fi

# Stop all services by reading PID files
stopped_count=0
for pidfile in logs/*.pid; do
    if [ -f "$pidfile" ]; then
        pid=$(cat "$pidfile")
        service_name=$(basename "$pidfile" .pid)
        
        if ps -p $pid > /dev/null 2>&1; then
            kill $pid 2>/dev/null
            echo "✅ Stopped $service_name (PID: $pid)"
            stopped_count=$((stopped_count + 1))
        else
            echo "⚠️  $service_name was not running"
        fi
        
        rm "$pidfile"
    fi
done

echo ""
if [ $stopped_count -gt 0 ]; then
    echo "✅ Stopped $stopped_count service(s)"
else
    echo "⚠️  No services were running"
fi
echo ""
