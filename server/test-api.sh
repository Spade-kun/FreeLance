#!/bin/bash

# Test API endpoints and create sample data
echo "🧪 Testing LMS API and Creating Sample Data..."
echo ""

API_GATEWAY="http://localhost:1001/api"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "=========================================="
echo "1️⃣  CREATING ADMIN USER"
echo "=========================================="
echo ""

ADMIN_RESPONSE=$(curl -s -X POST "$API_GATEWAY/users/admins" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Admin",
    "email": "admin@lms.com",
    "phone": "09123456789",
    "permissions": ["manage_users", "manage_courses", "view_reports"]
  }')

echo "$ADMIN_RESPONSE" | jq '.'
echo ""

# Extract admin ID for later use
ADMIN_ID=$(echo "$ADMIN_RESPONSE" | jq -r '.data._id // .data.userId // empty')

echo "=========================================="
echo "2️⃣  CREATING INSTRUCTOR"
echo "=========================================="
echo ""

INSTRUCTOR_RESPONSE=$(curl -s -X POST "$API_GATEWAY/users/instructors" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Maria",
    "lastName": "Santos",
    "email": "maria.santos@lms.com",
    "phone": "09234567890",
    "specialization": "Computer Science",
    "qualifications": "PhD in Computer Science",
    "bio": "Experienced educator with 10 years in teaching"
  }')

echo "$INSTRUCTOR_RESPONSE" | jq '.'
echo ""

# Extract instructor ID
INSTRUCTOR_ID=$(echo "$INSTRUCTOR_RESPONSE" | jq -r '.data._id // .data.userId // empty')

echo "=========================================="
echo "3️⃣  CREATING STUDENT"
echo "=========================================="
echo ""

STUDENT_RESPONSE=$(curl -s -X POST "$API_GATEWAY/users/students" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "email": "juan.delacruz@student.lms.com",
    "phone": "09345678901",
    "studentId": "2024-00001",
    "guardianName": "Pedro Dela Cruz",
    "guardianContact": "09456789012"
  }')

echo "$STUDENT_RESPONSE" | jq '.'
echo ""

# Extract student ID
STUDENT_ID=$(echo "$STUDENT_RESPONSE" | jq -r '.data._id // .data.userId // empty')

echo "=========================================="
echo "4️⃣  CREATING COURSE"
echo "=========================================="
echo ""

COURSE_RESPONSE=$(curl -s -X POST "$API_GATEWAY/courses" \
  -H "Content-Type: application/json" \
  -d '{
    "courseCode": "CS101",
    "courseName": "Introduction to Programming",
    "description": "Learn the fundamentals of programming using Python",
    "credits": 3,
    "level": "Undergraduate",
    "prerequisites": []
  }')

echo "$COURSE_RESPONSE" | jq '.'
echo ""

# Extract course ID
COURSE_ID=$(echo "$COURSE_RESPONSE" | jq -r '.data._id // empty')

echo "=========================================="
echo "5️⃣  CREATING COURSE SECTION"
echo "=========================================="
echo ""

if [ ! -z "$COURSE_ID" ] && [ ! -z "$INSTRUCTOR_ID" ]; then
  SECTION_RESPONSE=$(curl -s -X POST "$API_GATEWAY/courses/$COURSE_ID/sections" \
    -H "Content-Type: application/json" \
    -d "{
      \"sectionName\": \"CS101-A\",
      \"instructorId\": \"$INSTRUCTOR_ID\",
      \"capacity\": 30,
      \"schedule\": [
        {
          \"day\": \"Monday\",
          \"startTime\": \"09:00\",
          \"endTime\": \"10:30\"
        },
        {
          \"day\": \"Wednesday\",
          \"startTime\": \"09:00\",
          \"endTime\": \"10:30\"
        }
      ],
      \"room\": \"Room 201\"
    }")

  echo "$SECTION_RESPONSE" | jq '.'
  echo ""
  
  SECTION_ID=$(echo "$SECTION_RESPONSE" | jq -r '.data._id // empty')
else
  echo "⚠️  Skipping section creation (missing course or instructor ID)"
  echo ""
fi

echo "=========================================="
echo "6️⃣  CREATING ANNOUNCEMENT"
echo "=========================================="
echo ""

if [ ! -z "$ADMIN_ID" ]; then
  ANNOUNCEMENT_RESPONSE=$(curl -s -X POST "$API_GATEWAY/content/announcements" \
    -H "Content-Type: application/json" \
    -d "{
      \"title\": \"Welcome to the Learning Management System!\",
      \"content\": \"We are excited to have you here. Please check your courses and schedules.\",
      \"authorId\": \"$ADMIN_ID\",
      \"targetAudience\": [\"all\"],
      \"priority\": \"high\"
    }")

  echo "$ANNOUNCEMENT_RESPONSE" | jq '.'
  echo ""
else
  echo "⚠️  Skipping announcement creation (missing admin ID)"
  echo ""
fi

echo "=========================================="
echo "7️⃣  CREATING MODULE"
echo "=========================================="
echo ""

if [ ! -z "$COURSE_ID" ]; then
  MODULE_RESPONSE=$(curl -s -X POST "$API_GATEWAY/content/modules" \
    -H "Content-Type: application/json" \
    -d "{
      \"courseId\": \"$COURSE_ID\",
      \"title\": \"Module 1: Introduction to Python\",
      \"description\": \"Learn Python basics including variables, data types, and control structures\",
      \"order\": 1
    }")

  echo "$MODULE_RESPONSE" | jq '.'
  echo ""
  
  MODULE_ID=$(echo "$MODULE_RESPONSE" | jq -r '.data._id // empty')
else
  echo "⚠️  Skipping module creation (missing course ID)"
  echo ""
fi

echo "=========================================="
echo "8️⃣  CREATING ACTIVITY"
echo "=========================================="
echo ""

if [ ! -z "$COURSE_ID" ]; then
  ACTIVITY_RESPONSE=$(curl -s -X POST "$API_GATEWAY/assessments/activities" \
    -H "Content-Type: application/json" \
    -d "{
      \"courseId\": \"$COURSE_ID\",
      \"title\": \"Programming Assignment 1\",
      \"description\": \"Create a simple calculator program in Python\",
      \"type\": \"assignment\",
      \"totalPoints\": 100,
      \"dueDate\": \"2025-11-30T23:59:59Z\",
      \"allowLateSubmission\": true,
      \"latePenalty\": 10
    }")

  echo "$ACTIVITY_RESPONSE" | jq '.'
  echo ""
else
  echo "⚠️  Skipping activity creation (missing course ID)"
  echo ""
fi

echo ""
echo "=========================================="
echo "✅ SAMPLE DATA CREATED!"
echo "=========================================="
echo ""
echo "📊 Summary:"
echo "  • Admin: admin@lms.com (Password: Admin@123)"
echo "  • Instructor: maria.santos@lms.com (Password: Instructor@123)"
echo "  • Student: juan.delacruz@student.lms.com (Password: Student@123)"
echo "  • Course: CS101 - Introduction to Programming"
echo "  • Section: CS101-A (Mon/Wed 9:00-10:30)"
echo ""
echo "🔍 Check your MongoDB Atlas lms_mern database now!"
echo "   You should see collections: users, admins, instructors, students,"
echo "   courses, sections, announcements, modules, activities"
echo ""
echo "🌐 Test login:"
echo "   POST $API_GATEWAY/auth/login"
echo "   Body: { \"email\": \"admin@lms.com\", \"password\": \"Admin@123\" }"
echo ""
