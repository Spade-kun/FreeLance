#!/bin/bash

echo "🧪 Testing Gmail Email Service..."
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if email service is running
echo "1️⃣ Checking if email service is running..."
if curl -s http://localhost:1008/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Email service is running on port 1008${NC}"
else
    echo -e "${RED}❌ Email service is NOT running${NC}"
    echo -e "${YELLOW}Start it with: cd email-service && npm start${NC}"
    exit 1
fi

echo ""
echo "2️⃣ Checking email service health..."
HEALTH=$(curl -s http://localhost:1008/health)
echo "$HEALTH" | jq '.'

echo ""
echo "3️⃣ Enter your test email address:"
read -p "Email: " TEST_EMAIL

if [ -z "$TEST_EMAIL" ]; then
    echo -e "${RED}❌ No email provided. Exiting.${NC}"
    exit 1
fi

echo ""
echo "4️⃣ Sending test email to $TEST_EMAIL..."
RESPONSE=$(curl -s -X POST http://localhost:1008/api/email/test \
    -H "Content-Type: application/json" \
    -d "{\"email\": \"$TEST_EMAIL\"}")

echo "$RESPONSE" | jq '.'

if echo "$RESPONSE" | jq -e '.success == true' > /dev/null; then
    echo ""
    echo -e "${GREEN}✅ Test email sent successfully!${NC}"
    echo -e "${YELLOW}📧 Check your inbox: $TEST_EMAIL${NC}"
    echo ""
    echo "If you don't see the email:"
    echo "  - Check spam/junk folder"
    echo "  - Verify Gmail credentials in .env file"
    echo "  - Check email service logs"
else
    echo ""
    echo -e "${RED}❌ Failed to send test email${NC}"
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Check .env file has correct Gmail credentials"
    echo "2. Verify app password is correct (no spaces)"
    echo "3. Check email service logs for errors"
    echo "4. Try: cd email-service && npm start"
fi

echo ""
echo "5️⃣ Checking recent email logs..."
LOGS=$(curl -s "http://localhost:1008/api/email/logs?limit=5")
echo "$LOGS" | jq '.data | .[] | {recipient, subject, status, sentAt}'

echo ""
echo -e "${GREEN}✅ Email service test complete!${NC}"
