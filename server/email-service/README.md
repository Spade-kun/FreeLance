# 📧 LMS Email Service

Automated Gmail notification service for the Learning Management System.

## 🎯 Purpose

Automatically sends email notifications to enrolled students when instructors create new activities, assignments, quizzes, or exams.

## ✨ Features

- ✅ **Automatic email sending** when activity is created
- ✅ **Beautiful HTML email templates** with activity details
- ✅ **Batch emailing** to all enrolled students
- ✅ **Email logging** for tracking delivery status
- ✅ **Non-blocking** async email sending
- ✅ **Error handling** with graceful degradation

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Gmail

Create a `.env` file (copy from `.env.example`):
```env
PORT=1008
MONGODB_URI=mongodb://localhost:27017/lms_db
GMAIL_USER=your-email@gmail.com
GMAIL_APP_PASSWORD=your-16-char-app-password
FRONTEND_URL=http://localhost:5173
```

**Get Gmail App Password:**
1. Go to https://myaccount.google.com/apppasswords
2. Enable 2-Step Verification if not enabled
3. Create app password for "Mail"
4. Copy 16-character password (remove spaces)

### 3. Start Service
```bash
npm start
```

Service runs on **port 1008**.

### 4. Test Configuration
```bash
./test-email.sh
```

## 📚 Documentation

- **[GMAIL_SETUP.md](./GMAIL_SETUP.md)** - Complete Gmail setup guide
- **[IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md)** - Technical implementation details

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/email/send-activity-notification` | Send activity notification emails |
| GET | `/api/email/logs` | Get email sending logs |
| POST | `/api/email/test` | Test email configuration |
| GET | `/health` | Service health check |

## 📊 Example Request

```bash
curl -X POST http://localhost:1008/api/email/send-activity-notification \
  -H "Content-Type: application/json" \
  -d '{
    "courseId": "6751234567890abcdef",
    "title": "Midterm Project",
    "description": "Build a MERN stack application",
    "type": "assignment",
    "dueDate": "2025-11-22T23:59:00.000Z",
    "totalPoints": 100,
    "courseName": "Web Development",
    "courseCode": "CS101",
    "instructorName": "Prof. Smith"
  }'
```

## 📧 Email Template Preview

Students receive a beautiful HTML email with:
- Activity title and description
- Course information
- Due date highlighted
- Points value
- Direct link to student dashboard
- Late submission warning

## 🔧 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Service port | `1008` |
| `MONGODB_URI` | MongoDB connection | `mongodb://localhost:27017/lms_db` |
| `GMAIL_USER` | Gmail address | `lms@gmail.com` |
| `GMAIL_APP_PASSWORD` | Gmail app password | `abcdefghijklmnop` |
| `FRONTEND_URL` | Student dashboard URL | `http://localhost:5173` |

## 🗃️ Database Schema

### EmailLog Collection
```javascript
{
  emailLogId: Number,        // Auto-incremented ID
  recipient: String,         // Student email
  subject: String,           // Email subject
  type: String,              // 'new-activity', 'grade-notification', etc.
  status: String,            // 'pending', 'sent', 'failed'
  activityId: String,        // Activity ID
  courseId: String,          // Course ID
  sentAt: Date,              // When email was sent
  failureReason: String,     // Error message if failed
  retryCount: Number,        // Number of retry attempts
  createdAt: Date,           // Log creation timestamp
  updatedAt: Date            // Last update timestamp
}
```

## 🔍 Troubleshooting

### Email not sending?
1. Check `.env` file has correct credentials
2. Verify Gmail app password (no spaces)
3. Check service is running: `curl http://localhost:1008/health`
4. View logs: `curl http://localhost:1008/api/email/logs`

### "Invalid login credentials" error?
- Use **App Password**, not your Gmail password
- Enable 2-Step Verification first
- Generate new app password if needed

### Students not receiving emails?
- Check student emails in database
- Check spam/junk folders
- Verify enrollment status is "enrolled"
- Check email logs for failures

## 📈 Performance

- **Email sending:** ~0.5-1 second per email
- **Batch processing:** ~5-10 seconds for 30 students
- **Non-blocking:** Activity creation completes instantly
- **Memory usage:** ~50MB
- **CPU usage:** Low (spikes during email sending)

## 🔒 Security

- Uses Gmail App Password (not main password)
- Credentials stored in `.env` (not committed to Git)
- Environment variables encrypted in production
- Rate limiting to prevent abuse
- Email logs for audit trail

## 📦 Dependencies

- `express` - Web server
- `nodemailer` - Email sending
- `mongoose` - MongoDB ORM
- `axios` - HTTP requests
- `dotenv` - Environment variables
- `cors` - CORS handling

## 🎯 Integration

This service is automatically triggered when:
1. Instructor creates activity in `assessment-service`
2. `assessment-service` calls email service API
3. Email service fetches enrolled students
4. Emails sent to all students
5. Logs saved to database

## 📝 License

Part of the LMS project.

## 👨‍💻 Maintainer

LMS Development Team

---

**Status:** ✅ Production Ready

For detailed setup instructions, see [GMAIL_SETUP.md](./GMAIL_SETUP.md)
