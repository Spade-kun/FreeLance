#!/bin/bash

echo "🧪 Testing User Registration with ID Generation (Direct User Service)"
echo "======================================================================"
echo ""

USER_SERVICE_URL="http://localhost:1003/api/users"

# Test Student Registration
echo "📚 Testing Student Registration..."
STUDENT_RESPONSE=$(curl -s -X POST ${USER_SERVICE_URL}/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "TestDirect",
    "lastName": "Student",
    "email": "test.direct.student.'$(date +%s)'@example.com",
    "password": "password123"
  }')

echo "Response: $STUDENT_RESPONSE"
echo ""
STUDENT_ID=$(echo $STUDENT_RESPONSE | grep -o '"studentId":[0-9]*' | grep -o '[0-9]*' | head -1)
if [ -n "$STUDENT_ID" ]; then
  echo "✅ Student created with studentId: $STUDENT_ID"
else
  echo "❌ Failed to create student or studentId not found"
  echo "Full response: $STUDENT_RESPONSE"
fi
echo ""
echo "---"
echo ""

# Test Instructor Registration
echo "👨‍🏫 Testing Instructor Registration..."
INSTRUCTOR_RESPONSE=$(curl -s -X POST ${USER_SERVICE_URL}/instructors \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "TestDirect",
    "lastName": "Instructor",
    "email": "test.direct.instructor.'$(date +%s)'@example.com",
    "password": "password123",
    "specialization": "Testing"
  }')

echo "Response: $INSTRUCTOR_RESPONSE"
echo ""
INSTRUCTOR_ID=$(echo $INSTRUCTOR_RESPONSE | grep -o '"instructorId":[0-9]*' | grep -o '[0-9]*' | head -1)
if [ -n "$INSTRUCTOR_ID" ]; then
  echo "✅ Instructor created with instructorId: $INSTRUCTOR_ID"
else
  echo "❌ Failed to create instructor or instructorId not found"
  echo "Full response: $INSTRUCTOR_RESPONSE"
fi
echo ""
echo "---"
echo ""

# Test Admin Registration
echo "👑 Testing Admin Registration..."
ADMIN_RESPONSE=$(curl -s -X POST ${USER_SERVICE_URL}/admins \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "TestDirect",
    "lastName": "Admin",
    "email": "test.direct.admin.'$(date +%s)'@example.com",
    "password": "password123",
    "permissions": ["view_dashboard", "manage_users"]
  }')

echo "Response: $ADMIN_RESPONSE"
echo ""
ADMIN_ID=$(echo $ADMIN_RESPONSE | grep -o '"adminId":[0-9]*' | grep -o '[0-9]*' | head -1)
if [ -n "$ADMIN_ID" ]; then
  echo "✅ Admin created with adminId: $ADMIN_ID"
else
  echo "❌ Failed to create admin or adminId not found"
  echo "Full response: $ADMIN_RESPONSE"
fi
echo ""

echo "======================================================================"
echo "🎉 Testing Complete!"
echo ""
echo "📊 Summary:"
[ -n "$STUDENT_ID" ] && echo "   ✅ Student ID: $STUDENT_ID" || echo "   ❌ Student: FAILED"
[ -n "$INSTRUCTOR_ID" ] && echo "   ✅ Instructor ID: $INSTRUCTOR_ID" || echo "   ❌ Instructor: FAILED"
[ -n "$ADMIN_ID" ] && echo "   ✅ Admin ID: $ADMIN_ID" || echo "   ❌ Admin: FAILED"
echo ""

# Check the logs for the auto-generated ID messages
echo "📝 Checking user-service logs for ID generation..."
echo ""
tail -30 ../logs/user-service.log | grep "Auto-generated"
