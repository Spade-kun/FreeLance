import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_mern';

async function updateExistingIds() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Update Students
    console.log('\n📚 Updating Student IDs...');
    const studentCollection = db.collection('students');
    const studentsWithoutId = await studentCollection.find({ 
      $or: [
        { studentId: null },
        { studentId: { $exists: false } }
      ]
    }).toArray();

    if (studentsWithoutId.length > 0) {
      console.log(`Found ${studentsWithoutId.length} students without IDs`);
      
      // Get the highest existing studentId
      const lastStudent = await studentCollection.findOne(
        { studentId: { $ne: null, $exists: true } },
        { sort: { studentId: -1 } }
      );
      let nextStudentId = lastStudent ? lastStudent.studentId + 1 : 1;

      for (const student of studentsWithoutId) {
        await studentCollection.updateOne(
          { _id: student._id },
          { $set: { studentId: nextStudentId } }
        );
        console.log(`  ✅ Updated student ${student.email} with ID: ${nextStudentId}`);
        nextStudentId++;
      }
    } else {
      console.log('  ✅ All students already have IDs');
    }

    // Update Instructors
    console.log('\n👨‍🏫 Updating Instructor IDs...');
    const instructorCollection = db.collection('instructors');
    const instructorsWithoutId = await instructorCollection.find({ 
      $or: [
        { instructorId: null },
        { instructorId: { $exists: false } }
      ]
    }).toArray();

    if (instructorsWithoutId.length > 0) {
      console.log(`Found ${instructorsWithoutId.length} instructors without IDs`);
      
      // Get the highest existing instructorId
      const lastInstructor = await instructorCollection.findOne(
        { instructorId: { $ne: null, $exists: true } },
        { sort: { instructorId: -1 } }
      );
      let nextInstructorId = lastInstructor ? lastInstructor.instructorId + 1 : 1;

      for (const instructor of instructorsWithoutId) {
        await instructorCollection.updateOne(
          { _id: instructor._id },
          { $set: { instructorId: nextInstructorId } }
        );
        console.log(`  ✅ Updated instructor ${instructor.email} with ID: ${nextInstructorId}`);
        nextInstructorId++;
      }
    } else {
      console.log('  ✅ All instructors already have IDs');
    }

    // Update Admins
    console.log('\n👑 Updating Admin IDs...');
    const adminCollection = db.collection('admins');
    const adminsWithoutId = await adminCollection.find({ 
      $or: [
        { adminId: null },
        { adminId: { $exists: false } }
      ]
    }).toArray();

    if (adminsWithoutId.length > 0) {
      console.log(`Found ${adminsWithoutId.length} admins without IDs`);
      
      // Get the highest existing adminId
      const lastAdmin = await adminCollection.findOne(
        { adminId: { $ne: null, $exists: true } },
        { sort: { adminId: -1 } }
      );
      let nextAdminId = lastAdmin ? lastAdmin.adminId + 1 : 1;

      for (const admin of adminsWithoutId) {
        await adminCollection.updateOne(
          { _id: admin._id },
          { $set: { adminId: nextAdminId } }
        );
        console.log(`  ✅ Updated admin ${admin.email} with ID: ${nextAdminId}`);
        nextAdminId++;
      }
    } else {
      console.log('  ✅ All admins already have IDs');
    }

    console.log('\n✅ All existing records updated successfully!');
    console.log('\n📊 Summary:');
    console.log(`   - Students updated: ${studentsWithoutId.length}`);
    console.log(`   - Instructors updated: ${instructorsWithoutId.length}`);
    console.log(`   - Admins updated: ${adminsWithoutId.length}`);
    console.log('\n🎉 Database is now ready for new registrations!');

  } catch (error) {
    console.error('\n❌ Error updating IDs:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

updateExistingIds();
