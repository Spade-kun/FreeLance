#!/bin/bash

# Simple script to test a single service
echo "🧪 Testing Auth Service..."
echo ""

cd /home/spade/Public/Repository/MERN_FREELANCE/server/auth-service

echo "Starting Auth Service on port 1002..."
npm run dev
