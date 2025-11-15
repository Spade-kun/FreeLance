#!/bin/bash

echo "🧪 Testing Google Drive Upload..."
echo ""

# Create a test file
echo "This is a test file for Google Drive upload" > test-file.txt

# Upload the file
RESPONSE=$(curl -s -X POST http://localhost:1006/api/assessments/files/upload \
  -F "file=@test-file.txt" \
  -F "studentId=test123" \
  -F "activityId=test456")

echo "Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

# Clean up
rm test-file.txt

echo ""
if echo "$RESPONSE" | grep -q "driveFileId"; then
  echo "✅ SUCCESS! File uploaded to both local and Google Drive"
  echo ""
  echo "Check your Google Drive folder:"
  echo "https://drive.google.com/drive/folders/13mF-Da5YDRV-SNRyKqMOpLCNsxLAvw-x"
else
  echo "❌ FAILED! Check the error message above"
fi
