#!/bin/bash

echo "🔍 Verifying Google OAuth Configuration..."
echo ""

# Load environment variables
cd "$(dirname "$0")/auth-service"
source .env 2>/dev/null || { echo "❌ Cannot load .env file"; exit 1; }

echo "📋 Current Configuration:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Client ID: $GOOGLE_CLIENT_ID"
echo "Client Secret: ${GOOGLE_CLIENT_SECRET:0:20}... (showing first 20 chars)"
echo "Callback URL: $GOOGLE_CALLBACK_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

echo "🔍 Validation Checks:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Client ID is set
if [ -z "$GOOGLE_CLIENT_ID" ]; then
    echo "❌ GOOGLE_CLIENT_ID is not set"
else
    echo "✅ GOOGLE_CLIENT_ID is set"
    
    # Check if it ends with .apps.googleusercontent.com
    if [[ "$GOOGLE_CLIENT_ID" == *.apps.googleusercontent.com ]]; then
        echo "✅ Client ID format is correct"
    else
        echo "❌ Client ID should end with .apps.googleusercontent.com"
    fi
fi

# Check if Client Secret is set
if [ -z "$GOOGLE_CLIENT_SECRET" ]; then
    echo "❌ GOOGLE_CLIENT_SECRET is not set"
else
    echo "✅ GOOGLE_CLIENT_SECRET is set"
    
    # Check if it starts with GOCSPX-
    if [[ "$GOOGLE_CLIENT_SECRET" == GOCSPX-* ]]; then
        echo "✅ Client Secret format is correct"
    else
        echo "⚠️  Client Secret should typically start with GOCSPX-"
    fi
fi

# Check for extra spaces or quotes
if [[ "$GOOGLE_CLIENT_ID" =~ [[:space:]] ]]; then
    echo "❌ Client ID contains spaces"
else
    echo "✅ No spaces in Client ID"
fi

if [[ "$GOOGLE_CLIENT_ID" =~ [\'\"] ]]; then
    echo "❌ Client ID contains quotes"
else
    echo "✅ No quotes in Client ID"
fi

echo ""
echo "🌐 Testing Google OAuth Endpoint:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Test if auth service is running
if curl -s http://localhost:1002/health > /dev/null; then
    echo "✅ Auth service is running on port 1002"
else
    echo "❌ Auth service is not responding on port 1002"
fi

# Test API Gateway redirect
echo ""
echo "Testing API Gateway redirect..."
REDIRECT_URL=$(curl -s -I http://localhost:1001/api/auth/google | grep -i "location:" | awk '{print $2}' | tr -d '\r')
if [ ! -z "$REDIRECT_URL" ]; then
    echo "✅ API Gateway redirects to: $REDIRECT_URL"
else
    echo "❌ API Gateway does not redirect properly"
fi

echo ""
echo "📝 Recommendations:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Verify credentials in Google Cloud Console:"
echo "   https://console.cloud.google.com/apis/credentials"
echo ""
echo "2. Check that your OAuth Client ID exists and is not deleted"
echo ""
echo "3. Ensure these URLs are in 'Authorized JavaScript origins':"
echo "   - http://localhost:5173"
echo "   - http://localhost:5174"
echo "   - http://localhost:1001"
echo "   - http://localhost:1002"
echo ""
echo "4. Ensure this URL is in 'Authorized redirect URIs':"
echo "   - http://localhost:1002/api/auth/google/callback"
echo ""
echo "5. Wait 5-10 minutes after creating new credentials (Google propagation)"
echo ""
echo "6. Clear browser cache and try again"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
