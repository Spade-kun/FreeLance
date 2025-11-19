#!/bin/bash

echo "=========================================="
echo "Testing Signup Email Validation"
echo "=========================================="
echo ""

API_GATEWAY="http://localhost:1001"
TEST_EMAIL="test.validation@example.com"

echo "Step 1: Create a test student account"
echo "--------------------------------------"
RESPONSE=$(curl -s -X POST "${API_GATEWAY}/api/users/students" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Validation",
    "email": "'${TEST_EMAIL}'",
    "phone": "1234567890",
    "password": "test123456",
    "recaptchaToken": "test_token"
  }')

echo "$RESPONSE" | jq '.'
STUDENT_ID=$(echo "$RESPONSE" | jq -r '.data._id')
echo ""
echo "Created student ID: $STUDENT_ID"
echo ""

if [ "$STUDENT_ID" = "null" ] || [ -z "$STUDENT_ID" ]; then
  echo "❌ Failed to create student. Stopping test."
  exit 1
fi

echo "Step 2: Try to create ANOTHER student with the SAME email"
echo "-----------------------------------------------------------"
RESPONSE=$(curl -s -X POST "${API_GATEWAY}/api/users/students" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Another",
    "lastName": "Student",
    "email": "'${TEST_EMAIL}'",
    "phone": "9876543210",
    "password": "another123456",
    "recaptchaToken": "test_token"
  }')

echo "$RESPONSE" | jq '.'
MESSAGE=$(echo "$RESPONSE" | jq -r '.message')
echo ""

if [[ "$MESSAGE" == *"already exists"* ]]; then
  echo "✅ SUCCESS: Email validation working! Got message: $MESSAGE"
else
  echo "❌ FAILED: Should have rejected duplicate email"
fi
echo ""

echo "Step 3: Try to create an instructor with the SAME email"
echo "---------------------------------------------------------"
RESPONSE=$(curl -s -X POST "${API_GATEWAY}/api/users/instructors" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Instructor",
    "lastName": "Test",
    "email": "'${TEST_EMAIL}'",
    "phone": "5555555555",
    "password": "instructor123",
    "specialization": "Math",
    "recaptchaToken": "test_token"
  }')

echo "$RESPONSE" | jq '.'
MESSAGE=$(echo "$RESPONSE" | jq -r '.message')
echo ""

if [[ "$MESSAGE" == *"already exists"* ]]; then
  echo "✅ SUCCESS: Email validation across roles working! Got message: $MESSAGE"
else
  echo "❌ FAILED: Should have rejected duplicate email across roles"
fi
echo ""

echo "Step 4: Try to create an admin with the SAME email"
echo "----------------------------------------------------"
RESPONSE=$(curl -s -X POST "${API_GATEWAY}/api/users/admins" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Admin",
    "lastName": "Test",
    "email": "'${TEST_EMAIL}'",
    "phone": "7777777777",
    "password": "admin123",
    "permissions": ["view_dashboard"],
    "recaptchaToken": "test_token"
  }')

echo "$RESPONSE" | jq '.'
MESSAGE=$(echo "$RESPONSE" | jq -r '.message')
echo ""

if [[ "$MESSAGE" == *"already exists"* ]]; then
  echo "✅ SUCCESS: Email validation for admin working! Got message: $MESSAGE"
else
  echo "❌ FAILED: Should have rejected duplicate email for admin"
fi
echo ""

echo "Step 5: Clean up - Delete the test student"
echo "-------------------------------------------"
if [ "$STUDENT_ID" != "null" ] && [ -n "$STUDENT_ID" ]; then
  curl -s -X DELETE "${API_GATEWAY}/api/users/students/${STUDENT_ID}" | jq '.'
  echo ""
  echo "✅ Test student deleted"
else
  echo "⚠️  No student to delete"
fi
echo ""

echo "Step 6: Try to create a NEW account with the same email after deletion"
echo "-----------------------------------------------------------------------"
sleep 2  # Give time for deletion to propagate

RESPONSE=$(curl -s -X POST "${API_GATEWAY}/api/users/students" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "After",
    "lastName": "Deletion",
    "email": "'${TEST_EMAIL}'",
    "phone": "3333333333",
    "password": "newpass123",
    "recaptchaToken": "test_token"
  }')

echo "$RESPONSE" | jq '.'
NEW_STUDENT_ID=$(echo "$RESPONSE" | jq -r '.data._id')
echo ""

if [ "$NEW_STUDENT_ID" != "null" ] && [ -n "$NEW_STUDENT_ID" ]; then
  echo "✅ SUCCESS: Email is available again after deletion!"
  echo "New student ID: $NEW_STUDENT_ID"
  
  # Clean up
  echo ""
  echo "Cleaning up new test account..."
  curl -s -X DELETE "${API_GATEWAY}/api/users/students/${NEW_STUDENT_ID}" | jq '.'
  echo "✅ Cleanup complete"
else
  echo "❌ FAILED: Should have been able to create account after deletion"
fi
echo ""

echo "=========================================="
echo "Test Complete!"
echo "=========================================="
