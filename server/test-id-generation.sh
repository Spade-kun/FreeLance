#!/bin/bash

echo "🧪 Testing User Registration with ID Generation"
echo "=============================================="
echo ""

API_URL="http://localhost:1001/api"

# Test Student Registration
echo "📚 Testing Student Registration..."
STUDENT_RESPONSE=$(curl -s -X POST ${API_URL}/users/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Student",
    "email": "test.student.'$(date +%s)'@example.com",
    "password": "password123"
  }')

echo "Response: $STUDENT_RESPONSE"
STUDENT_ID=$(echo $STUDENT_RESPONSE | grep -o '"studentId":[0-9]*' | grep -o '[0-9]*')
if [ -n "$STUDENT_ID" ]; then
  echo "✅ Student created with studentId: $STUDENT_ID"
else
  echo "❌ Failed to create student or studentId not found"
fi
echo ""

# Test Instructor Registration
echo "👨‍🏫 Testing Instructor Registration..."
INSTRUCTOR_RESPONSE=$(curl -s -X POST ${API_URL}/users/instructors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Instructor",
    "email": "test.instructor.'$(date +%s)'@example.com",
    "password": "password123",
    "specialization": "Testing"
  }')

echo "Response: $INSTRUCTOR_RESPONSE"
INSTRUCTOR_ID=$(echo $INSTRUCTOR_RESPONSE | grep -o '"instructorId":[0-9]*' | grep -o '[0-9]*')
if [ -n "$INSTRUCTOR_ID" ]; then
  echo "✅ Instructor created with instructorId: $INSTRUCTOR_ID"
else
  echo "❌ Failed to create instructor or instructorId not found"
fi
echo ""

# Test Admin Registration
echo "👑 Testing Admin Registration..."
ADMIN_RESPONSE=$(curl -s -X POST ${API_URL}/users/admins \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Admin",
    "email": "test.admin.'$(date +%s)'@example.com",
    "password": "password123",
    "permissions": ["view_dashboard", "manage_users"]
  }')

echo "Response: $ADMIN_RESPONSE"
ADMIN_ID=$(echo $ADMIN_RESPONSE | grep -o '"adminId":[0-9]*' | grep -o '[0-9]*')
if [ -n "$ADMIN_ID" ]; then
  echo "✅ Admin created with adminId: $ADMIN_ID"
else
  echo "❌ Failed to create admin or adminId not found"
fi
echo ""

echo "=============================================="
echo "🎉 Testing Complete!"
echo ""
echo "📊 Summary:"
[ -n "$STUDENT_ID" ] && echo "   ✅ Student ID: $STUDENT_ID" || echo "   ❌ Student: FAILED"
[ -n "$INSTRUCTOR_ID" ] && echo "   ✅ Instructor ID: $INSTRUCTOR_ID" || echo "   ❌ Instructor: FAILED"
[ -n "$ADMIN_ID" ] && echo "   ✅ Admin ID: $ADMIN_ID" || echo "   ❌ Admin: FAILED"
