const emailService = require('../services/emailService');

// Send new activity notification
exports.sendNewActivityNotification = async (req, res) => {
  try {
    const activityData = req.body;

    // Validate required fields
    if (!activityData.courseId || !activityData.title || !activityData.type) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: courseId, title, type'
      });
    }

    console.log('📧 Received request to send new activity notification');
    console.log('Activity data:', activityData);

    const result = await emailService.sendNewActivityNotification(activityData);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        sentCount: result.sentCount,
        failedCount: result.failedCount,
        totalStudents: result.totalStudents
      }
    });

  } catch (error) {
    console.error('Error in sendNewActivityNotification controller:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send email notifications',
      error: error.message
    });
  }
};

// Get email logs
exports.getEmailLogs = async (req, res) => {
  try {
    const filters = {
      type: req.query.type,
      status: req.query.status,
      courseId: req.query.courseId,
      activityId: req.query.activityId,
      limit: parseInt(req.query.limit) || 100
    };

    const logs = await emailService.getEmailLogs(filters);

    res.status(200).json({
      success: true,
      data: logs,
      count: logs.length
    });

  } catch (error) {
    console.error('Error fetching email logs:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch email logs',
      error: error.message
    });
  }
};

// Test email configuration
exports.testEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required'
      });
    }

    const { createGmailTransporter } = require('../config/gmail');
    const transporter = createGmailTransporter();

    const mailOptions = {
      from: `"LMS Test" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Test Email from LMS',
      html: '<h1>✅ Gmail Configuration Working!</h1><p>Your email service is properly configured.</p>'
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({
      success: true,
      message: `Test email sent successfully to ${email}`
    });

  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
};
