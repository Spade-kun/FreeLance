#!/bin/bash

echo "🧹 Clearing Frontend Cache and Restarting..."
echo "=================================================="
echo ""

cd "$(dirname "$0")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "Step 1: Stopping any running Vite dev servers..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# Kill any process using port 5173 or 5174
pkill -f "vite" 2>/dev/null
lsof -ti:5173 | xargs kill -9 2>/dev/null
lsof -ti:5174 | xargs kill -9 2>/dev/null
echo "✅ Stopped existing dev servers"
echo ""

echo "Step 2: Clearing Vite cache..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
# Remove Vite cache
rm -rf node_modules/.vite
rm -rf .vite
rm -rf dist
echo "✅ Cleared Vite cache"
echo ""

echo "Step 3: Verifying .env configuration..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ -f .env ]; then
    source .env
    echo "Current VITE_GOOGLE_CLIENT_ID: $VITE_GOOGLE_CLIENT_ID"
    
    # Check if it's the old deleted client ID
    if [[ "$VITE_GOOGLE_CLIENT_ID" == "706284845222-0fk5il5u25h1doe0f392fmdhmunfi6f8.apps.googleusercontent.com" ]]; then
        echo "${RED}❌ ERROR: Still using OLD deleted Client ID!${NC}"
        echo "Please update .env with the NEW Client ID"
        exit 1
    else
        echo "${GREEN}✅ Using NEW Client ID${NC}"
    fi
else
    echo "${RED}❌ .env file not found!${NC}"
    exit 1
fi
echo ""

echo "Step 4: Starting fresh Vite dev server..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${YELLOW}Starting in 3 seconds...${NC}"
sleep 1
echo "2..."
sleep 1
echo "1..."
sleep 1
echo ""
echo "${GREEN}Starting npm run dev...${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📝 IMPORTANT NEXT STEPS:"
echo ""
echo "1. ${YELLOW}After the server starts, open your browser${NC}"
echo ""
echo "2. ${YELLOW}Clear browser cache:${NC}"
echo "   Press: Ctrl+Shift+Delete"
echo "   Select: Cookies and Cached images and files"
echo "   Time: Last hour"
echo "   Click: Clear data"
echo ""
echo "3. ${YELLOW}Or use Incognito mode:${NC}"
echo "   Press: Ctrl+Shift+N (Chrome) or Ctrl+Shift+P (Firefox)"
echo ""
echo "4. ${YELLOW}Go to: http://localhost:5173/login${NC}"
echo ""
echo "5. ${YELLOW}Try Google Sign-In${NC}"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start the dev server
npm run dev
