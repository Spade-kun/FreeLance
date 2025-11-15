import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_mern';

async function fixStudentIds() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    const studentCollection = db.collection('students');

    // Find all students
    const allStudents = await studentCollection.find({}).toArray();
    console.log(`\n📚 Found ${allStudents.length} students`);

    // Check for invalid IDs
    const invalidIds = allStudents.filter(s => {
      return typeof s.studentId !== 'number' || isNaN(s.studentId);
    });

    if (invalidIds.length > 0) {
      console.log(`\n⚠️  Found ${invalidIds.length} students with invalid IDs:`);
      invalidIds.forEach(s => {
        console.log(`   - ${s.email}: studentId = ${s.studentId} (type: ${typeof s.studentId})`);
      });

      // Fix them
      console.log('\n🔧 Fixing invalid IDs...');
      
      // Get the highest valid studentId
      const validStudents = allStudents.filter(s => 
        typeof s.studentId === 'number' && !isNaN(s.studentId)
      );
      
      let nextId = 1;
      if (validStudents.length > 0) {
        const maxId = Math.max(...validStudents.map(s => s.studentId));
        nextId = maxId + 1;
      }

      for (const student of invalidIds) {
        await studentCollection.updateOne(
          { _id: student._id },
          { $set: { studentId: nextId } }
        );
        console.log(`  ✅ Updated ${student.email}: studentId = ${nextId}`);
        nextId++;
      }
    } else {
      console.log('✅ All student IDs are valid');
    }

    // Display all students
    const updatedStudents = await studentCollection.find({}).sort({ studentId: 1 }).toArray();
    console.log('\n📋 All Students:');
    updatedStudents.forEach(s => {
      console.log(`   ${s.studentId} - ${s.firstName} ${s.lastName} (${s.email})`);
    });

  } catch (error) {
    console.error('\n❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixStudentIds();
