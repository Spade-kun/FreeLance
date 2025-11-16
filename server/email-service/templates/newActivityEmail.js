// Email template for new activity notification
const newActivityEmailTemplate = (studentName, activityData) => {
  const { 
    activityTitle, 
    activityDescription, 
    courseName, 
    courseCode,
    activityType, 
    dueDate, 
    totalPoints,
    instructorName 
  } = activityData;

  const formattedDueDate = new Date(dueDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 10px 10px 0 0;
      margin: -30px -30px 30px -30px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 24px;
    }
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: bold;
      margin: 10px 5px;
    }
    .badge-assignment {
      background-color: #e0f2fe;
      color: #0369a1;
    }
    .badge-quiz {
      background-color: #fef3c7;
      color: #92400e;
    }
    .badge-exam {
      background-color: #fee2e2;
      color: #991b1b;
    }
    .info-box {
      background-color: #f0f9ff;
      border-left: 4px solid #3b82f6;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .info-row {
      display: flex;
      justify-content: space-between;
      margin: 10px 0;
      padding: 8px 0;
      border-bottom: 1px solid #e5e7eb;
    }
    .info-label {
      font-weight: 600;
      color: #4b5563;
    }
    .info-value {
      color: #1f2937;
    }
    .due-date {
      background-color: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
      text-align: center;
    }
    .due-date strong {
      color: #d97706;
      font-size: 18px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 14px 30px;
      text-decoration: none;
      border-radius: 25px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      margin-top: 30px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      color: #6b7280;
      font-size: 14px;
    }
    .emoji {
      font-size: 24px;
      margin-right: 10px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📚 New ${activityType.charAt(0).toUpperCase() + activityType.slice(1)} Posted!</h1>
    </div>
    
    <p style="font-size: 16px;">Hi <strong>${studentName}</strong>,</p>
    
    <p>Your instructor <strong>${instructorName || 'has'}</strong> posted a new ${activityType} for your course:</p>
    
    <div class="info-box">
      <h2 style="margin-top: 0; color: #1e40af;">
        <span class="emoji">📝</span>${activityTitle}
      </h2>
      <p style="color: #4b5563;">${activityDescription || 'No description provided.'}</p>
    </div>

    <div class="info-row">
      <span class="info-label">📚 Course:</span>
      <span class="info-value"><strong>${courseCode}</strong> - ${courseName}</span>
    </div>

    <div class="info-row">
      <span class="info-label">📋 Type:</span>
      <span class="info-value">
        <span class="badge badge-${activityType}">${activityType.toUpperCase()}</span>
      </span>
    </div>

    <div class="info-row">
      <span class="info-label">🎯 Points:</span>
      <span class="info-value"><strong>${totalPoints}</strong> points</span>
    </div>

    <div class="due-date">
      <p style="margin: 0 0 8px 0; color: #92400e;">⏰ <strong>Due Date:</strong></p>
      <p style="margin: 0; font-size: 16px;"><strong>${formattedDueDate}</strong></p>
    </div>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/student/activities" class="cta-button">
        View Activity & Submit
      </a>
    </div>

    <div style="background-color: #fff7ed; border-left: 4px solid #f97316; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <p style="margin: 0; color: #9a3412;">
        <strong>⚠️ Remember:</strong> Submit your work before the due date to avoid late penalties.
      </p>
    </div>

    <div class="footer">
      <p>This is an automated notification from your Learning Management System.</p>
      <p>Please do not reply to this email.</p>
      <p style="margin-top: 10px;">© ${new Date().getFullYear()} LMS - All Rights Reserved</p>
    </div>
  </div>
</body>
</html>
  `;
};

module.exports = newActivityEmailTemplate;
