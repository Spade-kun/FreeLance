# 📧 Gmail Email Notification Setup Guide

## Overview
The email service automatically sends Gmail notifications to enrolled students when instructors create new activities/assignments.

## Features
✅ **Automatic Email Notifications** when instructor creates activity
✅ **Beautiful HTML Email Templates** with course and activity details
✅ **Batch Email Sending** to all enrolled students
✅ **Email Logging** for tracking sent/failed emails
✅ **Non-Blocking** - activity creation continues even if email fails

---

## 🔧 Setup Instructions

### Step 1: Enable Gmail App Password

1. **Go to Google Account Settings**
   - Visit: https://myaccount.google.com/

2. **Enable 2-Step Verification** (if not already enabled)
   - Go to Security → 2-Step Verification
   - Follow the setup wizard

3. **Create App Password**
   - Go to: https://myaccount.google.com/apppasswords
   - Or: Security → 2-Step Verification → App passwords
   - Select app: "Mail"
   - Select device: "Other (Custom name)"
   - Enter name: "LMS Email Service"
   - Click **Generate**
   - Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)

### Step 2: Configure Email Service

1. **Navigate to email-service directory**
   ```bash
   cd server/email-service
   ```

2. **Update .env file**
   ```env
   PORT=1008
   MONGODB_URI=mongodb://localhost:27017/lms_db

   # Gmail Configuration
   GMAIL_USER=your-actual-email@gmail.com
   GMAIL_APP_PASSWORD=abcdefghijklmnop  # No spaces!

   # Frontend URL
   FRONTEND_URL=http://localhost:5173
   ```

   **Important:**
   - Replace `your-actual-email@gmail.com` with your Gmail address
   - Replace `abcdefghijklmnop` with your 16-character app password (remove spaces)
   - This is the same Gmail account that will send emails

### Step 3: Install Dependencies

```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server/email-service
npm install
```

Dependencies installed:
- `nodemailer` - Email sending
- `express` - Web server
- `mongoose` - MongoDB ORM
- `axios` - HTTP requests
- `dotenv` - Environment variables

### Step 4: Start Email Service

**Option 1: Start all services (recommended)**
```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server
./start-all.sh
```

**Option 2: Start email service only**
```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server/email-service
npm start
```

The service will run on **port 1008**.

---

## 📤 How It Works

### Workflow:
1. **Instructor creates activity** in InstructorsDashboard
2. **Assessment service** receives the request
3. **Activity is saved** to database
4. **Email service is triggered** (asynchronously)
5. **Email service fetches** enrolled students from course-service
6. **Batch emails sent** to all students via Gmail
7. **Email logs saved** to database
8. **Instructor sees** success message with email confirmation

### Email Content:
- **Subject:** `📚 New [TYPE]: [Activity Title]`
- **Body Includes:**
  - Activity title and description
  - Course code and name
  - Activity type (assignment/quiz/exam)
  - Due date (formatted)
  - Total points
  - Instructor name
  - "View Activity" button (links to student portal)
  - Warning about late submissions

---

## 🧪 Testing

### Test 1: Test Email Configuration
```bash
curl -X POST http://localhost:1008/api/email/test \
  -H "Content-Type: application/json" \
  -d '{"email": "your-test-email@gmail.com"}'
```

Expected: You should receive a test email.

### Test 2: Create Activity (Real Test)
1. Login as **Instructor**
2. Go to **Assessments** page
3. Select a course
4. Click **+ Add Activity**
5. Fill in activity details
6. Click **Create Activity**
7. Check enrolled students' Gmail inboxes

### Test 3: View Email Logs
```bash
curl http://localhost:1008/api/email/logs
```

Or through API Gateway:
```bash
curl http://localhost:1001/api/email/logs
```

---

## 📊 API Endpoints

### Email Service (Port 1008)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/email/send-activity-notification` | Send new activity emails |
| GET | `/api/email/logs` | Get email sending logs |
| POST | `/api/email/test` | Test email configuration |
| GET | `/health` | Health check |

### Via API Gateway (Port 1001)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/email/send-activity-notification` | Send new activity emails |
| GET | `/api/email/logs?status=sent&limit=50` | Get filtered logs |
| POST | `/api/email/test` | Test email |

---

## 🗃️ Database Schema

### Email Logs Collection
```javascript
{
  emailLogId: 1,
  recipient: "student@example.com",
  subject: "New assignment: Midterm Project",
  type: "new-activity",
  status: "sent",  // or "pending", "failed"
  activityId: "6751234567890abcdef",
  courseId: "6751234567890abcdef",
  sentAt: "2025-11-16T08:30:00.000Z",
  failureReason: null,
  retryCount: 0,
  createdAt: "2025-11-16T08:30:00.000Z"
}
```

---

## 🎯 Customization

### Change Email Template
Edit: `/server/email-service/templates/newActivityEmail.js`

You can customize:
- Colors and styling
- Email layout
- Button text
- Footer content
- Logo/branding

### Add More Email Types
1. Create new template in `templates/` folder
2. Add new function in `services/emailService.js`
3. Add new controller in `controllers/emailController.js`
4. Add new route in `routes/emailRoutes.js`

---

## 🔍 Troubleshooting

### Problem: "Invalid login credentials"
**Solution:**
- Make sure you're using **App Password**, not regular Gmail password
- Remove spaces from app password in .env
- Verify 2-Step Verification is enabled

### Problem: "No enrolled students found"
**Solution:**
- Make sure students are enrolled in the course (check enrollments table)
- Verify enrollment status is "enrolled" not "pending"
- Check MongoDB: `db.enrollments.find({courseId: "your-course-id"})`

### Problem: Emails not sending
**Solution:**
1. Check email service is running: `curl http://localhost:1008/health`
2. Check .env configuration
3. View email logs: `curl http://localhost:1008/api/email/logs`
4. Check console logs for errors

### Problem: Students not receiving emails
**Solution:**
- Check student email addresses in database
- Check spam/junk folders
- Verify Gmail sending limits (500 emails/day for free accounts)
- Check email logs for failures

### Problem: "Error fetching enrolled students"
**Solution:**
- Ensure course-service is running (port 1004)
- Ensure user-service is running (port 1002)
- Check network connectivity between services

---

## 📈 Email Limits

### Gmail Limits (Free Account):
- **500 emails per day**
- **100 recipients per email**
- **Rate limit:** ~10-20 emails per minute

### Recommendations:
- For large courses (100+ students), consider using bulk email service
- Consider adding delay between emails if hitting rate limits
- Monitor email logs for failures

---

## 🔐 Security Best Practices

1. **Never commit .env file** to Git
2. **Use app passwords** instead of main Gmail password
3. **Rotate app passwords** periodically
4. **Monitor email logs** for suspicious activity
5. **Use different Gmail account** for production

---

## 🚀 Production Deployment

For production, consider:
- **SendGrid**, **AWS SES**, or **Mailgun** instead of Gmail
- **Redis queue** for email job processing
- **Retry mechanism** for failed emails
- **Email templates** in database for easy updates
- **Unsubscribe links** for compliance
- **Email analytics** (open rates, clicks)

---

## 📝 Example Email Preview

```
Subject: 📚 New ASSIGNMENT: Midterm Project

Hi John Doe,

Your instructor Prof. Smith has posted a new assignment for your course:

📝 Midterm Project
Build a full-stack MERN application with authentication and CRUD operations.

📚 Course: CS101 - Web Development
📋 Type: ASSIGNMENT
🎯 Points: 100 points

⏰ Due Date: Friday, November 22, 2025 at 11:59 PM

[View Activity & Submit Button]

⚠️ Remember: Submit your work before the due date to avoid late penalties.
```

---

## ✅ Checklist

- [ ] Gmail App Password created
- [ ] `.env` file updated with credentials
- [ ] Dependencies installed (`npm install`)
- [ ] Email service started (port 1008)
- [ ] Test email sent successfully
- [ ] Created test activity as instructor
- [ ] Student received email notification
- [ ] Email logs show "sent" status

---

## 📞 Support

If you encounter issues:
1. Check console logs in email-service
2. Check email logs in database
3. Verify all microservices are running
4. Test Gmail credentials separately

**Email Service Status:**
- Service: `http://localhost:1008/health`
- Logs: `http://localhost:1008/api/email/logs`

---

## 🎉 Success!

Once configured, instructors will automatically send email notifications to all enrolled students whenever they create a new activity. Students will receive beautiful HTML emails in their Gmail inbox with all the activity details!

**No additional steps needed** - the system handles everything automatically!
