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

// Send welcome email to new user
exports.sendWelcomeEmail = async (req, res) => {
  try {
    const { email, firstName, lastName, role, password } = req.body;

    if (!email || !firstName || !role) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: email, firstName, role'
      });
    }

    const { createGmailTransporter } = require('../config/gmail');
    const transporter = createGmailTransporter();

    const roleName = role.charAt(0).toUpperCase() + role.slice(1);
    const fullName = `${firstName} ${lastName || ''}`.trim();

    const mailOptions = {
      from: `"LMS System" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Welcome to LMS - Your ${roleName} Account`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to LMS! 🎓</h2>
          <p>Hello <strong>${fullName}</strong>,</p>
          <p>Your ${roleName} account has been successfully created by an administrator.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${email}</p>
            ${password ? `<p><strong>Temporary Password:</strong> ${password}</p>` : ''}
            <p style="color: #dc2626; font-size: 14px;">⚠️ Please change your password after your first login.</p>
          </div>
          
          <p>You can now login to the system at: <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/login">Login Here</a></p>
          
          <p>If you have any questions, please contact your administrator.</p>
          
          <p>Best regards,<br>LMS Team</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log(`✅ Welcome email sent to ${email}`);

    res.status(200).json({
      success: true,
      message: `Welcome email sent successfully to ${email}`
    });

  } catch (error) {
    console.error('Error sending welcome email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send welcome email',
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
