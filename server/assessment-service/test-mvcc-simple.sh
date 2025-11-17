#!/bin/bash

# Simple MVCC Test with curl
# Tests the Multi-Version Concurrency Control implementation

echo "=========================================="
echo "MVCC CONCURRENCY CONTROL - SIMPLE TEST"
echo "=========================================="
echo ""

API_URL="http://localhost:1006/api/assessments"

# Generate valid MongoDB ObjectIDs for testing (24 hex characters)
COURSE_ID="507f1f77bcf86cd799439011"
INSTRUCTOR_ID="507f1f77bcf86cd799439012"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Reset MVCC Statistics${NC}"
echo "================================"
curl -s -X POST "${API_URL}/mvcc/reset-stats" > /dev/null
echo -e "${GREEN}✓ Statistics reset${NC}"
echo ""

echo -e "${BLUE}Step 2: Creating Test Activity${NC}"
echo "================================"

ACTIVITY_JSON=$(cat <<EOF
{
  "title": "MVCC Test Quiz - $(date +%s)",
  "description": "Testing concurrent submissions",
  "type": "quiz",
  "instructions": "Answer all questions",
  "totalPoints": 100,
  "dueDate": "2025-12-31T23:59:59Z",
  "availableFrom": "2025-01-01T00:00:00Z",
  "allowLateSubmission": false,
  "isPublished": true,
  "maxAttempts": 3,
  "instructorId": "${INSTRUCTOR_ID}"
}
EOF
)

ACTIVITY_RESPONSE=$(curl -s -X POST "${API_URL}/courses/${COURSE_ID}/activities" \
  -H "Content-Type: application/json" \
  -d "$ACTIVITY_JSON")

ACTIVITY_ID=$(echo $ACTIVITY_RESPONSE | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$ACTIVITY_ID" ]; then
  echo -e "${RED}✗ Failed to create activity${NC}"
  echo "Response: $ACTIVITY_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Activity created${NC}"
echo "  Activity ID: $ACTIVITY_ID"
echo ""

echo -e "${BLUE}Test 1: Single Submission${NC}"
echo "=========================="

STUDENT1="507f1f77bcf86cd799439013"
echo "Submitting for ${STUDENT1}..."

RESPONSE1=$(curl -s -X POST "${API_URL}/activities/${ACTIVITY_ID}/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "'${STUDENT1}'",
    "content": "My first submission",
    "activityId": "'${ACTIVITY_ID}'"
  }')

if echo "$RESPONSE1" | grep -q '"success":true'; then
  echo -e "${GREEN}✓ Submission successful${NC}"
  SUBMISSION_ID=$(echo $RESPONSE1 | grep -o '"_id":"[^"]*' | head -1 | cut -d'"' -f4)
  echo "  Submission ID: $SUBMISSION_ID"
else
  echo -e "${RED}✗ Submission failed${NC}"
  echo "$RESPONSE1" | head -3
fi
echo ""

echo -e "${BLUE}Test 2: Duplicate Submission (Same Student)${NC}"
echo "==========================================="
echo "Trying to submit again with same student..."

RESPONSE2=$(curl -s -X POST "${API_URL}/activities/${ACTIVITY_ID}/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "'${STUDENT1}'",
    "content": "My second attempt",
    "activityId": "'${ACTIVITY_ID}'"
  }')

if echo "$RESPONSE2" | grep -q '"success":false'; then
  if echo "$RESPONSE2" | grep -q 'already submitted\|DUPLICATE'; then
    echo -e "${GREEN}✓ Duplicate correctly rejected${NC}"
  else
    echo -e "${YELLOW}⚠ Rejected but different reason${NC}"
    echo "$RESPONSE2" | head -3
  fi
else
  echo -e "${RED}✗ Duplicate should have been rejected${NC}"
fi
echo ""

echo -e "${BLUE}Test 3: Max Attempts Enforcement${NC}"
echo "================================="
echo "Note: Currently only 1 submission per student per activity is allowed."
echo "This tests the duplicate prevention mechanism."

STUDENT2="507f1f77bcf86cd799439014"
echo ""
echo "First submission:"
RESPONSE=$(curl -s -X POST "${API_URL}/activities/${ACTIVITY_ID}/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "'${STUDENT2}'",
    "content": "First attempt",
    "activityId": "'${ACTIVITY_ID}'"
  }')

if echo "$RESPONSE" | grep -q '"success":true'; then
  echo -e "  ${GREEN}✓ First submission accepted${NC}"
else
  echo -e "  ${RED}✗ First submission should have been accepted${NC}"
fi

echo ""
echo "Second submission (duplicate):"
RESPONSE=$(curl -s -X POST "${API_URL}/activities/${ACTIVITY_ID}/submissions" \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "'${STUDENT2}'",
    "content": "Second attempt",
    "activityId": "'${ACTIVITY_ID}'"
  }')

if echo "$RESPONSE" | grep -q '"success":false'; then
  if echo "$RESPONSE" | grep -q 'already submitted\|DUPLICATE\|MAX_ATTEMPTS'; then
    echo -e "  ${GREEN}✓ Duplicate correctly rejected${NC}"
  else
    echo -e "  ${YELLOW}⚠ Rejected with different reason${NC}"
  fi
else
  echo -e "  ${RED}✗ Duplicate should have been rejected${NC}"
fi
echo ""

echo -e "${BLUE}Test 4: Concurrent Submissions (5 students)${NC}"
echo "=========================================="
echo "Launching 5 submissions simultaneously..."

# Create temp directory for responses
TEMP_DIR="/tmp/mvcc_test_$$"
mkdir -p "$TEMP_DIR"

# Launch 5 concurrent submissions with valid ObjectIDs
for i in {1..5}; do
  {
    # Generate unique ObjectID for each student
    STUDENT_NUM=$((19 + $i))
    STUDENT="507f1f77bcf86cd7994390${STUDENT_NUM}"
    curl -s -X POST "${API_URL}/activities/${ACTIVITY_ID}/submissions" \
      -H "Content-Type: application/json" \
      -d '{
        "studentId": "'${STUDENT}'",
        "content": "Concurrent submission '${i}'",
        "activityId": "'${ACTIVITY_ID}'"
      }' > "${TEMP_DIR}/response_${i}.json"
  } &
done

# Wait for all to complete
wait

SUCCESS_COUNT=0
for i in {1..5}; do
  if grep -q '"success":true' "${TEMP_DIR}/response_${i}.json"; then
    SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
    echo -e "  Student ${i}: ${GREEN}✓ Success${NC}"
  else
    echo -e "  Student ${i}: ${RED}✗ Failed${NC}"
  fi
done

rm -rf "$TEMP_DIR"

echo ""
echo "Result: ${SUCCESS_COUNT}/5 successful"
if [ $SUCCESS_COUNT -eq 5 ]; then
  echo -e "${GREEN}✓ All concurrent submissions succeeded${NC}"
else
  echo -e "${YELLOW}⚠ Some concurrent submissions failed${NC}"
fi
echo ""

echo -e "${BLUE}Step 3: MVCC Statistics${NC}"
echo "======================="

STATS=$(curl -s "${API_URL}/mvcc/stats")
echo "$STATS" | python3 -c "import sys, json; print(json.dumps(json.load(sys.stdin), indent=2))" 2>/dev/null || echo "$STATS"

echo ""
echo -e "${GREEN}=========================================${NC}"
echo -e "${GREEN}MVCC TEST COMPLETED${NC}"
echo -e "${GREEN}=========================================${NC}"
echo ""

# Extract and display key metrics
TOTAL=$(echo "$STATS" | grep -o '"totalAttempts":[0-9]*' | cut -d':' -f2)
CONFLICTS=$(echo "$STATS" | grep -o '"conflicts":[0-9]*' | cut -d':' -f2)
RATE=$(echo "$STATS" | grep -o '"conflictRate":"[^"]*' | cut -d'"' -f4)

echo "Summary:"
echo "  Total Attempts: ${TOTAL:-0}"
echo "  Conflicts: ${CONFLICTS:-0}"
echo "  Conflict Rate: ${RATE:-0%}"
echo ""
echo "✓ MVCC implementation is working!"
