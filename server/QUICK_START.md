# Quick Start Guide

## � Platform Support

✅ **Linux/Mac** - Use `.sh` scripts  
✅ **Windows** - Use `.bat` or `.ps1` scripts (See [WINDOWS_SETUP.md](WINDOWS_SETUP.md))

---

## �🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies

**Linux/Mac:**
```bash
cd /home/spade/Public/Repository/MERN_FREELANCE/server
./install-all.sh
```

**Windows PowerShell:**
```powershell
cd path\to\MERN_FREELANCE\server
.\install-all.ps1
```

**Windows CMD:**
```cmd
cd path\to\MERN_FREELANCE\server
install-all.bat
```

This will install all dependencies for all 7 microservices.

### Step 2: Set Up Environment Variables

Copy the `.env.example` files and configure them:

```bash
# Quick setup (uses default values)
for service in api-gateway auth-service user-service course-service content-service assessment-service report-service; do
  cp $service/.env.example $service/.env
done
```

**Important**: Edit each `.env` file and update:
- MongoDB connection strings
- JWT secrets (use strong random strings)
- Email configuration (for auth-service)

### Step 3: Start MongoDB

```bash
# If using system MongoDB
sudo systemctl start mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Step 4: Start All Services

```bash
./start-all.sh
```

This will open separate terminal tabs for each service.

### Step 5: Verify Services

Open your browser or use curl:

```bash
# Check API Gateway
curl http://localhost:1001/health

# Check all services
for port in 1001 1002 1003 1004 1005 1006 1007; do
  echo "Checking port $port:"
  curl http://localhost:$port/health
  echo ""
done
```

## 📝 Test the API

### 1. Create a Student Account

```bash
curl -X POST http://localhost:1001/api/users/students \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "studentId": "STU001",
    "phone": "1234567890"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:1001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "Student@123"
  }'
```

Save the `accessToken` from the response.

### 3. Get Profile

```bash
curl -X GET http://localhost:1001/api/users/profile/YOUR_USER_ID?role=student \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## 🎯 Default Credentials

When you create users through the API, they get default passwords:

- **Admin**: `Admin@123`
- **Instructor**: `Instructor@123`
- **Student**: `Student@123`

**Important**: Users should change these passwords on first login!

## 📂 Project Structure

```
server/
├── api-gateway/          (Port 1001) - Main entry point
├── auth-service/         (Port 1002) - Authentication
├── user-service/         (Port 1003) - User management
├── course-service/       (Port 1004) - Course management
├── content-service/      (Port 1005) - Learning content
├── assessment-service/   (Port 1006) - Activities & grading
├── report-service/       (Port 1007) - Reports & analytics
├── README.md             - Full documentation
├── API_DOCUMENTATION.md  - API details
├── DEPLOYMENT.md         - Deployment guide
└── QUICK_START.md        - This file
```

## 🔧 Troubleshooting

### Services won't start?

1. Check if MongoDB is running:
   ```bash
   sudo systemctl status mongod
   ```

2. Check if ports are already in use:
   ```bash
   netstat -tulpn | grep -E "1001|1002|1003|1004|1005|1006|1007"
   ```

3. Check service logs in the terminal windows

### MongoDB connection errors?

1. Verify MongoDB is running
2. Check MongoDB connection string in `.env` files
3. Ensure MongoDB is accessible (check firewall)

### Can't access API Gateway?

1. Check if port 1001 is accessible:
   ```bash
   curl http://localhost:1001/health
   ```

2. Check API Gateway logs

3. Verify other services are running

## 📚 Next Steps

1. **Read the full documentation**: `README.md`
2. **Explore API endpoints**: `API_DOCUMENTATION.md`
3. **Set up for production**: `DEPLOYMENT.md`
4. **Connect your React frontend**: Update API URLs to `http://localhost:1001/api`

## 🎓 Example Workflow

### Admin Workflow

1. Create admin account
2. Login as admin
3. Create courses
4. Create instructors
5. Create students
6. Assign instructors to courses
7. Enroll students in courses
8. Post announcements
9. View reports

### Instructor Workflow

1. Login as instructor
2. View assigned courses
3. Create modules and lessons
4. Upload learning materials
5. Create activities/assignments
6. Grade submissions
7. Record attendance
8. View student reports

### Student Workflow

1. Login as student
2. View dashboard with announcements
3. Browse enrolled courses
4. Access learning materials
5. Submit assignments
6. View grades
7. Check attendance
8. Track progress

## 💡 Tips

- Use a tool like **Postman** or **Insomnia** for API testing
- Keep terminal windows organized by service name
- Monitor logs for debugging
- Use the health check endpoints frequently
- Start with creating an admin user first

## 🆘 Need Help?

Check the following files:
- `README.md` - Comprehensive documentation
- `API_DOCUMENTATION.md` - Detailed API reference
- `DEPLOYMENT.md` - Production deployment guide

---

**Happy Coding! 🚀**
