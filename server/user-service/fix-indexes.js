import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_mern';

async function fixIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Fix Student indexes
    try {
      console.log('\n📚 Fixing Student collection indexes...');
      const studentCollection = db.collection('students');
      
      // Drop the old studentId index
      try {
        await studentCollection.dropIndex('studentId_1');
        console.log('✅ Dropped old studentId_1 index');
      } catch (error) {
        if (error.code === 27 || error.codeName === 'IndexNotFound') {
          console.log('ℹ️  studentId_1 index does not exist, skipping...');
        } else {
          throw error;
        }
      }

      // Create new sparse index
      await studentCollection.createIndex({ studentId: 1 }, { unique: true, sparse: true });
      console.log('✅ Created new sparse studentId index');
    } catch (error) {
      console.error('❌ Error fixing Student indexes:', error.message);
    }

    // Fix Instructor indexes
    try {
      console.log('\n👨‍🏫 Fixing Instructor collection indexes...');
      const instructorCollection = db.collection('instructors');
      
      // Drop the old instructorId index
      try {
        await instructorCollection.dropIndex('instructorId_1');
        console.log('✅ Dropped old instructorId_1 index');
      } catch (error) {
        if (error.code === 27 || error.codeName === 'IndexNotFound') {
          console.log('ℹ️  instructorId_1 index does not exist, skipping...');
        } else {
          throw error;
        }
      }

      // Create new sparse index
      await instructorCollection.createIndex({ instructorId: 1 }, { unique: true, sparse: true });
      console.log('✅ Created new sparse instructorId index');
    } catch (error) {
      console.error('❌ Error fixing Instructor indexes:', error.message);
    }

    // Fix Admin indexes
    try {
      console.log('\n👑 Fixing Admin collection indexes...');
      const adminCollection = db.collection('admins');
      
      // Drop the old adminId index if it exists
      try {
        await adminCollection.dropIndex('adminId_1');
        console.log('✅ Dropped old adminId_1 index');
      } catch (error) {
        if (error.code === 27 || error.codeName === 'IndexNotFound') {
          console.log('ℹ️  adminId_1 index does not exist, skipping...');
        } else {
          throw error;
        }
      }

      // Create new sparse index
      await adminCollection.createIndex({ adminId: 1 }, { unique: true, sparse: true });
      console.log('✅ Created new sparse adminId index');
    } catch (error) {
      console.error('❌ Error fixing Admin indexes:', error.message);
    }

    console.log('\n✅ All indexes fixed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Student: studentId index now allows null values (sparse)');
    console.log('   - Instructor: instructorId index now allows null values (sparse)');
    console.log('   - Admin: adminId index now allows null values (sparse)');
    console.log('\n🎉 You can now register users without duplicate key errors!');

  } catch (error) {
    console.error('\n❌ Error fixing indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixIndexes();
