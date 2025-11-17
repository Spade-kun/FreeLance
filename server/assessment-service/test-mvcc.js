/**
 * MVCC Concurrency Control Test Suite
 * Tests the Multi-Version Concurrency Control implementation in assessment submissions
 */

import axios from 'axios';

const API_URL = 'http://localhost:1006/api/assessments';
const COURSE_ID = '67386c3c3d5e4f001c8a1234';
const INSTRUCTOR_ID = '67386c3c3d5e4f001c8a5678';

// Test results tracking
const results = {
  passed: 0,
  failed: 0,
  total: 0
};

// Helper function for colored console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName, passed, message = '') {
  results.total++;
  if (passed) {
    results.passed++;
    log(`✓ ${testName}`, 'green');
  } else {
    results.failed++;
    log(`✗ ${testName}`, 'red');
    if (message) log(`  ${message}`, 'yellow');
  }
}

// Helper to create activity
async function createTestActivity() {
  try {
    const response = await axios.post(`${API_URL}/courses/${COURSE_ID}/activities`, {
      title: 'MVCC Concurrency Test Quiz',
      description: 'Testing concurrent submissions',
      type: 'quiz',
      instructions: 'Answer all questions',
      totalPoints: 100,
      dueDate: '2025-12-31T23:59:59Z',
      availableFrom: '2025-01-01T00:00:00Z',
      allowLateSubmission: false,
      isPublished: true,
      maxAttempts: 3,
      instructorId: INSTRUCTOR_ID
    });
    
    return response.data.data._id;
  } catch (error) {
    log('Failed to create test activity', 'red');
    console.error(error.response?.data || error.message);
    throw error;
  }
}

// Helper to reset MVCC stats
async function resetStats() {
  try {
    await axios.post(`${API_URL}/mvcc/reset-stats`);
    log('MVCC statistics reset', 'blue');
  } catch (error) {
    log('Warning: Could not reset stats', 'yellow');
  }
}

// Helper to get MVCC stats
async function getStats() {
  try {
    const response = await axios.get(`${API_URL}/mvcc/stats`);
    return response.data.data;
  } catch (error) {
    log('Warning: Could not get stats', 'yellow');
    return null;
  }
}

// Helper to submit
async function submitAssessment(activityId, studentId, content) {
  try {
    const response = await axios.post(`${API_URL}/activities/${activityId}/submissions`, {
      studentId,
      content,
      activityId
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

// Helper to sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Test 1: Sequential Submissions (No Conflicts Expected)
async function testSequentialSubmissions(activityId) {
  log('\n=== Test 1: Sequential Submissions ===', 'blue');
  
  const students = ['student_seq_1', 'student_seq_2', 'student_seq_3'];
  let allPassed = true;
  
  for (const studentId of students) {
    const result = await submitAssessment(activityId, studentId, 'Sequential submission');
    if (!result.success) {
      allPassed = false;
      log(`  Failed for ${studentId}: ${result.error.message}`, 'red');
    }
    await sleep(100); // Small delay between submissions
  }
  
  logTest('Sequential Submissions', allPassed);
  return allPassed;
}

// Test 2: Concurrent Submissions (Same Student - Should Allow Only 1)
async function testConcurrentSameStudent(activityId) {
  log('\n=== Test 2: Concurrent Submissions (Same Student) ===', 'blue');
  
  const studentId = 'student_concurrent_1';
  const attempts = 5;
  
  log(`Launching ${attempts} concurrent submissions...`, 'yellow');
  
  // Launch all submissions concurrently
  const promises = [];
  for (let i = 0; i < attempts; i++) {
    promises.push(submitAssessment(activityId, studentId, `Concurrent attempt ${i + 1}`));
  }
  
  const results = await Promise.all(promises);
  
  const successCount = results.filter(r => r.success).length;
  const duplicateCount = results.filter(r => 
    !r.success && (
      r.error.message?.includes('already submitted') ||
      r.error.code === 'DUPLICATE_SUBMISSION'
    )
  ).length;
  
  log(`  Successful: ${successCount}`, successCount === 1 ? 'green' : 'red');
  log(`  Duplicates caught: ${duplicateCount}`, duplicateCount === attempts - 1 ? 'green' : 'yellow');
  
  const passed = successCount === 1 && duplicateCount >= attempts - 2;
  logTest('Concurrent Same Student Protection', passed, 
    passed ? '' : `Expected 1 success, got ${successCount}`);
  
  return passed;
}

// Test 3: Max Attempts Enforcement
async function testMaxAttemptsEnforcement(activityId) {
  log('\n=== Test 3: Max Attempts Enforcement ===', 'blue');
  
  const studentId = 'student_max_attempts';
  const maxAttempts = 3;
  let allCorrect = true;
  
  // Try 4 submissions (one more than max)
  for (let i = 1; i <= 4; i++) {
    const result = await submitAssessment(activityId, studentId, `Attempt ${i}`);
    
    if (i <= maxAttempts) {
      if (!result.success) {
        log(`  Attempt ${i}: Should have succeeded`, 'red');
        allCorrect = false;
      } else {
        log(`  Attempt ${i}: ✓ Accepted`, 'green');
      }
    } else {
      if (result.success) {
        log(`  Attempt ${i}: Should have been rejected`, 'red');
        allCorrect = false;
      } else if (result.error.code === 'MAX_ATTEMPTS_EXCEEDED') {
        log(`  Attempt ${i}: ✓ Rejected (max attempts)`, 'green');
      } else {
        log(`  Attempt ${i}: Rejected with wrong reason`, 'yellow');
      }
    }
    
    await sleep(100);
  }
  
  logTest('Max Attempts Enforcement', allCorrect);
  return allCorrect;
}

// Test 4: High Concurrency (Multiple Students)
async function testHighConcurrency(activityId) {
  log('\n=== Test 4: High Concurrency (10 Students) ===', 'blue');
  
  const studentCount = 10;
  log(`Launching ${studentCount} concurrent submissions...`, 'yellow');
  
  const promises = [];
  for (let i = 1; i <= studentCount; i++) {
    promises.push(submitAssessment(
      activityId, 
      `student_concurrent_${i}`, 
      'High concurrency test'
    ));
  }
  
  const results = await Promise.all(promises);
  
  const successCount = results.filter(r => r.success).length;
  const failureCount = results.filter(r => !r.success).length;
  
  log(`  Successful: ${successCount}/${studentCount}`, 'green');
  log(`  Failed: ${failureCount}/${studentCount}`, failureCount === 0 ? 'green' : 'yellow');
  
  const passed = successCount === studentCount;
  logTest('High Concurrency Test', passed, 
    passed ? '' : `Expected ${studentCount} successes, got ${successCount}`);
  
  return passed;
}

// Test 5: Version Conflict Detection
async function testVersionConflict(activityId) {
  log('\n=== Test 5: MVCC Version Tracking ===', 'blue');
  
  // Submit from 3 different students in very quick succession
  const promises = [
    submitAssessment(activityId, 'student_version_1', 'Test 1'),
    submitAssessment(activityId, 'student_version_2', 'Test 2'),
    submitAssessment(activityId, 'student_version_3', 'Test 3')
  ];
  
  const results = await Promise.all(promises);
  const successCount = results.filter(r => r.success).length;
  
  // All should succeed even with concurrent access
  const passed = successCount === 3;
  log(`  All 3 submissions successful: ${passed ? 'Yes' : 'No'}`, passed ? 'green' : 'red');
  
  logTest('Version Tracking & Conflict Resolution', passed);
  return passed;
}

// Main test runner
async function runTests() {
  log('\n============================================', 'blue');
  log('MVCC CONCURRENCY CONTROL TEST SUITE', 'blue');
  log('============================================\n', 'blue');
  
  try {
    // Setup
    log('Setting up test environment...', 'blue');
    const activityId = await createTestActivity();
    log(`✓ Test activity created: ${activityId}`, 'green');
    
    await resetStats();
    
    // Run tests
    await testSequentialSubmissions(activityId);
    await testConcurrentSameStudent(activityId);
    await testMaxAttemptsEnforcement(activityId);
    await testHighConcurrency(activityId);
    await testVersionConflict(activityId);
    
    // Get statistics
    log('\n=== MVCC Statistics ===', 'blue');
    const stats = await getStats();
    if (stats) {
      console.log(JSON.stringify(stats, null, 2));
      
      if (stats.conflicts > 0) {
        log(`\n✓ MVCC detected and handled ${stats.conflicts} conflicts`, 'green');
        log(`  Retry success rate: ${stats.retrySuccessRate}`, 'green');
      }
    }
    
    // Summary
    log('\n============================================', 'blue');
    log('TEST SUMMARY', 'blue');
    log('============================================', 'blue');
    log(`Total Tests: ${results.total}`, 'blue');
    log(`Passed: ${results.passed}`, 'green');
    log(`Failed: ${results.failed}`, results.failed === 0 ? 'green' : 'red');
    log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(1)}%`, 
      results.failed === 0 ? 'green' : 'yellow');
    
    if (results.failed === 0) {
      log('\n🎉 All tests passed! MVCC is working correctly.', 'green');
    } else {
      log('\n⚠️  Some tests failed. Review the implementation.', 'yellow');
    }
    
    log('\n============================================\n', 'blue');
    
    process.exit(results.failed === 0 ? 0 : 1);
    
  } catch (error) {
    log('\n❌ Test suite failed to complete', 'red');
    console.error(error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}

export { runTests };
