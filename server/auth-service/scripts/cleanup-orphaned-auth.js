import axios from 'axios';
import User from '../models/User.js';
import '../config/database.js';

/**
 * Cleanup Orphaned Auth Records
 * 
 * This script finds and removes auth service records (User collection)
 * that don't have corresponding records in the user-service
 * (Student, Instructor, or Admin collections).
 * 
 * Run this after deleting users directly from the database.
 */

const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:1003';

async function cleanupOrphanedRecords() {
  console.log('🧹 Starting orphaned auth records cleanup...\n');

  try {
    // Get all users from auth service
    const authUsers = await User.find({});
    console.log(`📊 Found ${authUsers.length} auth records to check\n`);

    let orphanedCount = 0;
    let validCount = 0;
    let errorCount = 0;

    for (const authUser of authUsers) {
      try {
        // Check if corresponding user exists in user-service
        const endpoint = `${USER_SERVICE_URL}/api/users/${authUser.role}s/${authUser.userId}`;
        
        console.log(`🔍 Checking: ${authUser.email} (${authUser.role})`);
        
        const response = await axios.get(endpoint);
        
        if (response.data && response.data.success) {
          console.log(`   ✅ Valid - user exists in user-service`);
          validCount++;
        } else {
          console.log(`   ⚠️  Response indicates user not found`);
          await User.findByIdAndDelete(authUser._id);
          console.log(`   🗑️  Deleted orphaned auth record`);
          orphanedCount++;
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          // User not found in user-service - delete auth record
          console.log(`   ❌ User not found in user-service`);
          await User.findByIdAndDelete(authUser._id);
          console.log(`   🗑️  Deleted orphaned auth record`);
          orphanedCount++;
        } else {
          console.error(`   ⚠️  Error checking user:`, error.message);
          errorCount++;
        }
      }
      
      console.log(''); // Empty line for readability
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total auth records checked: ${authUsers.length}`);
    console.log(`Valid records (kept):       ${validCount}`);
    console.log(`Orphaned records (deleted): ${orphanedCount}`);
    console.log(`Errors encountered:         ${errorCount}`);
    console.log('='.repeat(60));

    if (orphanedCount > 0) {
      console.log(`\n✅ Successfully cleaned up ${orphanedCount} orphaned auth record(s)`);
    } else {
      console.log(`\n✅ No orphaned records found - database is clean!`);
    }

  } catch (error) {
    console.error('\n❌ Cleanup failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

// Run cleanup
cleanupOrphanedRecords();
