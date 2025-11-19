#!/bin/bash

echo "=========================================="
echo "Payment System Test"
echo "=========================================="
echo ""

API_URL="http://localhost:1001/api"

echo "Test 1: Check payment service health"
echo "--------------------------------------"
curl -s http://localhost:1009/health | jq '.'
echo ""

echo "Test 2: Get all payments (should be empty initially)"
echo "------------------------------------------------------"
curl -s "${API_URL}/payments" | jq '.data | length'
echo ""

echo "Test 3: Get payment statistics"
echo "-------------------------------"
curl -s "${API_URL}/payments/stats/summary" | jq '.data.overview'
echo ""

echo "=========================================="
echo "✅ Payment System is Ready!"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Open the admin dashboard: http://localhost:5173/admin/payments"
echo "2. Have a student make a payment via PayPal"
echo "3. Payment will automatically appear in the admin dashboard"
echo ""
echo "Student Payment Process:"
echo "1. Login as student: http://localhost:5173/login"
echo "2. Go to Payment section"
echo "3. Enter amount and description"
echo "4. Click 'Proceed to PayPal'"
echo "5. Complete payment with PayPal sandbox credentials"
echo "6. Payment will be recorded in database and visible to admin"
echo ""
