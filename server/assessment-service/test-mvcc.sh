#!/bin/bash

# MVCC Concurrency Test Script
# Tests the Multi-Version Concurrency Control implementation

echo "============================================"
echo "MVCC CONCURRENCY CONTROL TEST"
echo "============================================"
echo ""

# Configuration
API_URL="http://localhost:5005/api/assessments"
COURSE_ID="67386c3c3d5e4f001c8a1234"
INSTRUCTOR_ID="67386c3c3d5e4f001c8a5678"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Step 1: Creating Test Activity${NC}"
echo "================================"

# Create activity with max attempts
ACTIVITY_RESPONSE=$(curl -s -X POST "${API_URL}/courses/${COURSE_ID}/activities" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "MVCC Concurrency Test Quiz",
    "description": "Testing concurrent submissions",
    "type": "quiz",
    "instructions": "Answer all questions",
    "totalPoints": 100,
    "dueDate": "2025-12-31T23:59:59Z",
    "availableFrom": "2025-01-01T00:00:00Z",
    "allowLateSubmission": false,
    "isPublished": true,
    "maxAttempts": 3,
    "instructorId": "'${INSTRUCTOR_ID}'"
  }')

ACTIVITY_ID=$(echo $ACTIVITY_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4)

if [ -z "$ACTIVITY_ID" ]; then
  echo -e "${RED}✗ Failed to create activity${NC}"
  echo "Response: $ACTIVITY_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Activity created successfully${NC}"
echo "Activity ID: $ACTIVITY_ID"
echo ""

echo -e "${BLUE}Step 2: Reset MVCC Statistics${NC}"
echo "================================"

curl -s -X POST "${API_URL}/mvcc/reset-stats" > /dev/null
echo -e "${GREEN}✓ Statistics reset${NC}"
echo ""

# Test Case 1: Sequential Submissions (No Conflict)
echo -e "${BLUE}Test Case 1: Sequential Submissions${NC}"
echo "===================================="

for i in {1..3}; do
  STUDENT_ID="student_seq_${i}"
  
  echo -n "Submitting for ${STUDENT_ID}... "
  
  RESPONSE=$(curl -s -X POST "${API_URL}/activities/${ACTIVITY_ID}/submissions" \
    -H "Content-Type: application/json" \
    -d '{
      "studentId": "'${STUDENT_ID}'",
      "content": "Sequential submission '${i}'",
      "activityId": "'${ACTIVITY_ID}'"
    }')
  
  SUCCESS=$(echo $RESPONSE | grep -o '"success":true')
  
  if [ -n "$SUCCESS" ]; then
    echo -e "${GREEN}✓ Success${NC}"
  else
    echo -e "${RED}✗ Failed${NC}"
    echo "Response: $RESPONSE"
  fi
  
  sleep 0.1
done

echo ""

# Test Case 2: Concurrent Submissions (Same Student)
echo -e "${BLUE}Test Case 2: Concurrent Submissions (Same Student)${NC}"
echo "=================================================="
echo "Simulating 5 concurrent attempts from same student..."

STUDENT_ID="student_concurrent_1"
TEMP_DIR="/tmp/mvcc_test_$$"
mkdir -p "$TEMP_DIR"

# Launch 5 concurrent requests
for i in {1..5}; do
  (
    RESPONSE=$(curl -s -X POST "${API_URL}/activities/${ACTIVITY_ID}/submissions" \
      -H "Content-Type: application/json" \
      -d '{
        "studentId": "'${STUDENT_ID}'",
        "content": "Concurrent submission attempt '${i}'",
        "activityId": "'${ACTIVITY_ID}'"
      }')
    
    echo "$RESPONSE" > "${TEMP_DIR}/response_${i}.json"
  ) &
done

# Wait for all background jobs
wait

echo "Analyzing results..."

SUCCESS_COUNT=0
CONFLICT_COUNT=0
DUPLICATE_COUNT=0

for i in {1..5}; do
  RESPONSE=$(cat "${TEMP_DIR}/response_${i}.json")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo -e "Attempt ${i}: ${GREEN}✓ Success${NC}"
  elif echo "$RESPONSE" | grep -q 'already submitted'; then
    DUPLICATE_COUNT=$((DUPLICATE_COUNT + 1))
    echo -e "Attempt ${i}: ${YELLOW}⚠ Duplicate (Expected)${NC}"
  else
    CONFLICT_COUNT=$((CONFLICT_COUNT + 1))
    echo -e "Attempt ${i}: ${YELLOW}⚠ Conflict/Retry${NC}"
  fi
done

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "Results:"
echo "- Successful: $SUCCESS_COUNT (Expected: 1)"
echo "- Duplicates: $DUPLICATE_COUNT (Expected: 4)"
echo "- Conflicts: $CONFLICT_COUNT"

if [ $SUCCESS_COUNT -eq 1 ]; then
  echo -e "${GREEN}✓ Concurrent submission test PASSED${NC}"
else
  echo -e "${RED}✗ Concurrent submission test FAILED${NC}"
fi

echo ""

# Test Case 3: Multiple Attempts (Testing Max Attempts)
echo -e "${BLUE}Test Case 3: Max Attempts Enforcement${NC}"
echo "======================================"

STUDENT_ID="student_max_attempts"

for i in {1..4}; do
  echo -n "Attempt ${i}/3... "
  
  RESPONSE=$(curl -s -X POST "${API_URL}/activities/${ACTIVITY_ID}/submissions" \
    -H "Content-Type: application/json" \
    -d '{
      "studentId": "'${STUDENT_ID}'",
      "content": "Attempt '${i}'",
      "activityId": "'${ACTIVITY_ID}'"
    }')
  
  if [ $i -le 3 ]; then
    if echo "$RESPONSE" | grep -q '"success":true'; then
      echo -e "${GREEN}✓ Accepted${NC}"
    else
      echo -e "${RED}✗ Rejected (Unexpected)${NC}"
      echo "Response: $RESPONSE"
    fi
  else
    if echo "$RESPONSE" | grep -q 'Maximum attempts'; then
      echo -e "${GREEN}✓ Rejected (Expected)${NC}"
    else
      echo -e "${RED}✗ Should have been rejected${NC}"
      echo "Response: $RESPONSE"
    fi
  fi
  
  sleep 0.1
done

echo ""

# Test Case 4: High Concurrency (10 students, simultaneous)
echo -e "${BLUE}Test Case 4: High Concurrency Test${NC}"
echo "===================================="
echo "Simulating 10 students submitting simultaneously..."

TEMP_DIR="/tmp/mvcc_test_concurrent_$$"
mkdir -p "$TEMP_DIR"

# Launch 10 concurrent requests from different students
for i in {1..10}; do
  (
    STUDENT_ID="student_concurrent_${i}"
    RESPONSE=$(curl -s -X POST "${API_URL}/activities/${ACTIVITY_ID}/submissions" \
      -H "Content-Type: application/json" \
      -d '{
        "studentId": "'${STUDENT_ID}'",
        "content": "High concurrency test submission",
        "activityId": "'${ACTIVITY_ID}'"
      }')
    
    echo "$RESPONSE" > "${TEMP_DIR}/student_${i}.json"
  ) &
done

# Wait for all
wait

SUCCESS_COUNT=0
FAILURE_COUNT=0

for i in {1..10}; do
  RESPONSE=$(cat "${TEMP_DIR}/student_${i}.json")
  
  if echo "$RESPONSE" | grep -q '"success":true'; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
  else
    FAILURE_COUNT=$((FAILURE_COUNT + 1))
  fi
done

# Cleanup
rm -rf "$TEMP_DIR"

echo "Results:"
echo "- Successful: $SUCCESS_COUNT/10"
echo "- Failed: $FAILURE_COUNT/10"

if [ $SUCCESS_COUNT -eq 10 ]; then
  echo -e "${GREEN}✓ High concurrency test PASSED${NC}"
else
  echo -e "${YELLOW}⚠ Some submissions failed (may need retry logic tuning)${NC}"
fi

echo ""

# Get MVCC Statistics
echo -e "${BLUE}Step 3: MVCC Statistics${NC}"
echo "======================="

STATS=$(curl -s "${API_URL}/mvcc/stats")

echo "$STATS" | python3 -m json.tool 2>/dev/null || echo "$STATS"

echo ""
echo -e "${BLUE}Test Summary${NC}"
echo "============"

# Extract statistics
TOTAL_ATTEMPTS=$(echo "$STATS" | grep -o '"totalAttempts":[0-9]*' | cut -d':' -f2)
CONFLICTS=$(echo "$STATS" | grep -o '"conflicts":[0-9]*' | cut -d':' -f2)
CONFLICT_RATE=$(echo "$STATS" | grep -o '"conflictRate":"[^"]*' | cut -d'"' -f4)

echo "Total Attempts: ${TOTAL_ATTEMPTS:-N/A}"
echo "Conflicts Detected: ${CONFLICTS:-N/A}"
echo "Conflict Rate: ${CONFLICT_RATE:-N/A}"

if [ -n "$CONFLICT_RATE" ]; then
  echo ""
  if (( $(echo "$CONFLICTS < $TOTAL_ATTEMPTS * 0.1" | bc -l) )); then
    echo -e "${GREEN}✓ MVCC is working efficiently (conflict rate < 10%)${NC}"
  else
    echo -e "${YELLOW}⚠ High conflict rate detected${NC}"
  fi
fi

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}MVCC CONCURRENCY TEST COMPLETED${NC}"
echo -e "${GREEN}============================================${NC}"
echo ""
echo "Note: To see real-time conflicts, run this test with higher concurrency"
echo "or on a system under load. The MVCC service handles conflicts"
echo "automatically with retry logic."
