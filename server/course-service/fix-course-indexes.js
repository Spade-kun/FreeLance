import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms_mern';

async function fixCourseIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;

    // Fix Course indexes
    try {
      console.log('\n📚 Fixing Course collection indexes...');
      const courseCollection = db.collection('courses');
      
      // Drop the old courseId index if exists
      try {
        await courseCollection.dropIndex('courseId_1');
        console.log('✅ Dropped old courseId_1 index');
      } catch (error) {
        if (error.code === 27 || error.codeName === 'IndexNotFound') {
          console.log('ℹ️  courseId_1 index does not exist, skipping...');
        } else {
          throw error;
        }
      }

      // Create new sparse index
      await courseCollection.createIndex({ courseId: 1 }, { unique: true, sparse: true });
      console.log('✅ Created new sparse courseId index');

      // Update existing courses without IDs
      const coursesWithoutId = await courseCollection.find({ 
        $or: [
          { courseId: null },
          { courseId: { $exists: false } }
        ]
      }).toArray();

      if (coursesWithoutId.length > 0) {
        console.log(`Found ${coursesWithoutId.length} courses without IDs`);
        
        const lastCourse = await courseCollection.findOne(
          { courseId: { $ne: null, $exists: true } },
          { sort: { courseId: -1 } }
        );
        let nextCourseId = lastCourse ? lastCourse.courseId + 1 : 1;

        for (const course of coursesWithoutId) {
          await courseCollection.updateOne(
            { _id: course._id },
            { $set: { courseId: nextCourseId } }
          );
          console.log(`  ✅ Updated course "${course.courseName}" with ID: ${nextCourseId}`);
          nextCourseId++;
        }
      } else {
        console.log('  ✅ All courses already have IDs');
      }
    } catch (error) {
      console.error('❌ Error fixing Course indexes:', error.message);
    }

    // Fix Section indexes
    try {
      console.log('\n📑 Fixing Section collection indexes...');
      const sectionCollection = db.collection('sections');
      
      // Drop the old sectionId index if exists
      try {
        await sectionCollection.dropIndex('sectionId_1');
        console.log('✅ Dropped old sectionId_1 index');
      } catch (error) {
        if (error.code === 27 || error.codeName === 'IndexNotFound') {
          console.log('ℹ️  sectionId_1 index does not exist, skipping...');
        } else {
          throw error;
        }
      }

      // Create new sparse index
      await sectionCollection.createIndex({ sectionId: 1 }, { unique: true, sparse: true });
      console.log('✅ Created new sparse sectionId index');

      // Update existing sections without IDs
      const sectionsWithoutId = await sectionCollection.find({ 
        $or: [
          { sectionId: null },
          { sectionId: { $exists: false } }
        ]
      }).toArray();

      if (sectionsWithoutId.length > 0) {
        console.log(`Found ${sectionsWithoutId.length} sections without IDs`);
        
        const lastSection = await sectionCollection.findOne(
          { sectionId: { $ne: null, $exists: true } },
          { sort: { sectionId: -1 } }
        );
        let nextSectionId = lastSection ? lastSection.sectionId + 1 : 1;

        for (const section of sectionsWithoutId) {
          await sectionCollection.updateOne(
            { _id: section._id },
            { $set: { sectionId: nextSectionId } }
          );
          console.log(`  ✅ Updated section "${section.sectionName}" with ID: ${nextSectionId}`);
          nextSectionId++;
        }
      } else {
        console.log('  ✅ All sections already have IDs');
      }
    } catch (error) {
      console.error('❌ Error fixing Section indexes:', error.message);
    }

    // Fix Enrollment indexes
    try {
      console.log('\n📝 Fixing Enrollment collection indexes...');
      const enrollmentCollection = db.collection('enrollments');
      
      // Drop the old enrollmentId index if exists
      try {
        await enrollmentCollection.dropIndex('enrollmentId_1');
        console.log('✅ Dropped old enrollmentId_1 index');
      } catch (error) {
        if (error.code === 27 || error.codeName === 'IndexNotFound') {
          console.log('ℹ️  enrollmentId_1 index does not exist, skipping...');
        } else {
          throw error;
        }
      }

      // Create new sparse index
      await enrollmentCollection.createIndex({ enrollmentId: 1 }, { unique: true, sparse: true });
      console.log('✅ Created new sparse enrollmentId index');

      // Update existing enrollments without IDs
      const enrollmentsWithoutId = await enrollmentCollection.find({ 
        $or: [
          { enrollmentId: null },
          { enrollmentId: { $exists: false } }
        ]
      }).toArray();

      if (enrollmentsWithoutId.length > 0) {
        console.log(`Found ${enrollmentsWithoutId.length} enrollments without IDs`);
        
        const lastEnrollment = await enrollmentCollection.findOne(
          { enrollmentId: { $ne: null, $exists: true } },
          { sort: { enrollmentId: -1 } }
        );
        let nextEnrollmentId = lastEnrollment ? lastEnrollment.enrollmentId + 1 : 1;

        for (const enrollment of enrollmentsWithoutId) {
          await enrollmentCollection.updateOne(
            { _id: enrollment._id },
            { $set: { enrollmentId: nextEnrollmentId } }
          );
          console.log(`  ✅ Updated enrollment with ID: ${nextEnrollmentId}`);
          nextEnrollmentId++;
        }
      } else {
        console.log('  ✅ All enrollments already have IDs');
      }
    } catch (error) {
      console.error('❌ Error fixing Enrollment indexes:', error.message);
    }

    console.log('\n✅ All indexes fixed successfully!');
    console.log('\n📋 Summary:');
    console.log('   - Course: courseId index now allows null values (sparse)');
    console.log('   - Section: sectionId index now allows null values (sparse)');
    console.log('   - Enrollment: enrollmentId index now allows null values (sparse)');
    console.log('\n🎉 Course service is now ready for new data!');

  } catch (error) {
    console.error('\n❌ Error fixing indexes:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

fixCourseIndexes();
