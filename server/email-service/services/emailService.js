const { createGmailTransporter } = require('../config/gmail');
const EmailLog = require('../models/EmailLog');
const newActivityEmailTemplate = require('../templates/newActivityEmail');
const axios = require('axios');

class EmailService {
  constructor() {
    this.transporter = createGmailTransporter();
  }

  // Get enrolled students for a course
  async getEnrolledStudents(courseId) {
    try {
      console.log('🔍 Fetching enrollments for course:', courseId);
      
      // Call course-service to get enrollments
      const enrollmentResponse = await axios.get(`http://localhost:1004/api/courses/enrollments`);
      const allEnrollments = enrollmentResponse.data.data || [];
      
      console.log(`📋 Total enrollments in database: ${allEnrollments.length}`);
      
      // Filter enrollments for this course
      const courseEnrollments = allEnrollments.filter(enrollment => {
        const enrollmentCourseId = typeof enrollment.courseId === 'object' 
          ? enrollment.courseId._id 
          : enrollment.courseId;
        return enrollmentCourseId === courseId && enrollment.status === 'enrolled';
      });

      console.log(`✅ Found ${courseEnrollments.length} enrollments for this course`);

      // Get student IDs from enrollments (these are MongoDB _id values)
      const enrolledStudentIds = courseEnrollments.map(e => e.studentId);
      
      if (enrolledStudentIds.length === 0) {
        console.log('⚠️ No enrolled students found for this course');
        return [];
      }

      console.log('👥 Student IDs from enrollments:', enrolledStudentIds);

      // Call user-service directly to get ALL student details
      const studentResponse = await axios.get(`http://localhost:1003/api/users/students`);
      const allStudents = studentResponse.data.data || [];
      
      console.log(`📚 Total students in database: ${allStudents.length}`);

      // Match students by their MongoDB _id (which matches enrollment.studentId)
      const enrolledStudents = allStudents.filter(student => {
        const studentMongoId = student._id?.toString();
        const isEnrolled = enrolledStudentIds.some(enrollId => enrollId.toString() === studentMongoId);
        
        if (isEnrolled) {
          console.log(`✓ Matched student: ${student.email} (ID: ${studentMongoId})`);
        }
        
        return isEnrolled;
      });

      console.log(`✅ Found ${enrolledStudents.length} students with emails`);
      
      return enrolledStudents;
    } catch (error) {
      console.error('❌ Error fetching enrolled students:', error.message);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', error.response.data);
      }
      throw error;
    }
  }

  // Send new activity notification to all enrolled students
  async sendNewActivityNotification(activityData) {
    try {
      console.log('📧 Starting to send new activity notifications...');
      console.log('Activity:', activityData.title);
      console.log('Course ID:', activityData.courseId);

      // Get enrolled students
      const enrolledStudents = await this.getEnrolledStudents(activityData.courseId);
      
      console.log(`📋 Found ${enrolledStudents.length} enrolled students`);

      if (enrolledStudents.length === 0) {
        return {
          success: true,
          message: 'No enrolled students found for this course',
          sentCount: 0,
          failedCount: 0
        };
      }

      const emailPromises = [];
      const emailLogs = [];

      for (const student of enrolledStudents) {
        const studentEmail = student.email;
        const studentName = `${student.firstName || ''} ${student.lastName || ''}`.trim() || 'Student';

        if (!studentEmail) {
          console.warn(`⚠️ Student ${student.studentId} has no email address`);
          continue;
        }

        // Create email log
        const emailLog = new EmailLog({
          recipient: studentEmail,
          subject: `New ${activityData.type}: ${activityData.title}`,
          type: 'new-activity',
          activityId: activityData._id || activityData.activityId,
          courseId: activityData.courseId,
          status: 'pending'
        });

        emailLogs.push(emailLog);

        // Prepare email content
        const emailHTML = newActivityEmailTemplate(studentName, {
          activityTitle: activityData.title,
          activityDescription: activityData.description,
          courseName: activityData.courseName,
          courseCode: activityData.courseCode,
          activityType: activityData.type,
          dueDate: activityData.dueDate,
          totalPoints: activityData.totalPoints,
          instructorName: activityData.instructorName
        });

        const mailOptions = {
          from: `"LMS Notifications" <${process.env.GMAIL_USER}>`,
          to: studentEmail,
          subject: `📚 New ${activityData.type.toUpperCase()}: ${activityData.title}`,
          html: emailHTML
        };

        // Send email
        const emailPromise = this.transporter.sendMail(mailOptions)
          .then(() => {
            emailLog.status = 'sent';
            emailLog.sentAt = new Date();
            console.log(`✅ Email sent to ${studentEmail}`);
            return { success: true, email: studentEmail };
          })
          .catch((error) => {
            emailLog.status = 'failed';
            emailLog.failureReason = error.message;
            console.error(`❌ Failed to send email to ${studentEmail}:`, error.message);
            return { success: false, email: studentEmail, error: error.message };
          })
          .finally(() => {
            return emailLog.save();
          });

        emailPromises.push(emailPromise);
      }

      // Wait for all emails to be sent
      const results = await Promise.all(emailPromises);
      
      const sentCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;

      console.log(`📊 Email Summary: ${sentCount} sent, ${failedCount} failed`);

      return {
        success: true,
        message: `Email notifications sent to ${sentCount} students`,
        sentCount,
        failedCount,
        totalStudents: enrolledStudents.length
      };

    } catch (error) {
      console.error('❌ Error sending new activity notifications:', error);
      throw error;
    }
  }

  // Get email logs
  async getEmailLogs(filters = {}) {
    try {
      const query = {};
      
      if (filters.type) query.type = filters.type;
      if (filters.status) query.status = filters.status;
      if (filters.courseId) query.courseId = filters.courseId;
      if (filters.activityId) query.activityId = filters.activityId;

      const logs = await EmailLog.find(query)
        .sort({ createdAt: -1 })
        .limit(filters.limit || 100);

      return logs;
    } catch (error) {
      console.error('Error fetching email logs:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
