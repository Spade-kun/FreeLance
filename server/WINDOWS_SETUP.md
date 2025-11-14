# 🪟 Windows Setup Guide

## Prerequisites

1. **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
2. **Git** - [Download](https://git-scm.com/download/win)
3. **MongoDB Atlas Account** - [Sign up](https://www.mongodb.com/cloud/atlas)

## Installation

### Method 1: Using PowerShell (Recommended) ✨

PowerShell scripts have better error handling and colored output.

1. **Open PowerShell as Administrator**
   - Search "PowerShell" → Right-click → "Run as Administrator"

2. **Enable script execution** (one-time setup):
   ```powershell
   Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

3. **Navigate to server folder**:
   ```powershell
   cd path\to\MERN_FREELANCE\server
   ```

4. **Install dependencies**:
   ```powershell
   .\install-all.ps1
   ```

5. **Configure .env files** (already done if you followed main setup)

6. **Start all services**:
   ```powershell
   .\start-all.ps1
   ```

7. **Check service status**:
   ```powershell
   .\check-services.ps1
   ```

8. **Stop all services**:
   ```powershell
   .\stop-all.ps1
   ```

### Method 2: Using Batch Files (.bat)

If you prefer Command Prompt or can't use PowerShell:

1. **Open Command Prompt**
   - Search "cmd" → Right-click → "Run as Administrator"

2. **Navigate to server folder**:
   ```cmd
   cd path\to\MERN_FREELANCE\server
   ```

3. **Install dependencies**:
   ```cmd
   install-all.bat
   ```

4. **Start all services**:
   ```cmd
   start-all.bat
   ```

5. **Check service status**:
   ```cmd
   check-services.bat
   ```

6. **Stop all services**:
   ```cmd
   stop-all.bat
   ```

## Available Scripts

### PowerShell Scripts (.ps1)
- `start-all.ps1` - Start all 7 microservices
- `stop-all.ps1` - Stop all running services
- `check-services.ps1` - Check status of all services
- `install-all.ps1` - Install npm dependencies for all services

### Batch Files (.bat)
- `start-all.bat` - Start all 7 microservices
- `stop-all.bat` - Stop all running services
- `check-services.bat` - Check status of all services
- `install-all.bat` - Install npm dependencies for all services

## Troubleshooting

### PowerShell Script Execution Error

**Error**: "cannot be loaded because running scripts is disabled"

**Solution**:
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Port Already in Use

**Error**: "EADDRINUSE: address already in use :::1001"

**Solution (PowerShell)**:
```powershell
# Find and kill process on port 1001
$process = Get-NetTCPConnection -LocalPort 1001 -ErrorAction SilentlyContinue
if ($process) {
    Stop-Process -Id $process.OwningProcess -Force
}
```

**Solution (Command Prompt)**:
```cmd
netstat -ano | findstr :1001
taskkill /PID <PID_NUMBER> /F
```

### View Service Logs

**PowerShell**:
```powershell
# View last 20 lines and follow
Get-Content logs\auth-service.log -Tail 20 -Wait

# View all logs
Get-Content logs\auth-service.log
```

**Command Prompt**:
```cmd
type logs\auth-service.log
```

### MongoDB Connection Issues

1. Check if your IP is whitelisted in MongoDB Atlas
2. Verify `.env` files have correct MongoDB URI
3. Check internet connection

## Service URLs

Once all services are running:

- **API Gateway**: http://localhost:1001
- **Auth Service**: http://localhost:1002
- **User Service**: http://localhost:1003
- **Course Service**: http://localhost:1004
- **Content Service**: http://localhost:1005
- **Assessment Service**: http://localhost:1006
- **Report Service**: http://localhost:1007

## Testing API

### Using PowerShell (curl equivalent)

```powershell
# Create Admin
Invoke-RestMethod -Uri "http://localhost:1001/api/users/admins" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"firstName":"John","lastName":"Admin","email":"admin@lms.com","phone":"09123456789","permissions":["manage_users"]}'

# Login
Invoke-RestMethod -Uri "http://localhost:1001/api/auth/login" `
  -Method Post `
  -ContentType "application/json" `
  -Body '{"email":"admin@lms.com","password":"Admin@123"}'

# Get Courses
Invoke-RestMethod -Uri "http://localhost:1001/api/courses"
```

### Using Thunder Client Extension

1. Install Thunder Client extension in VS Code
2. Import collection from `thunder-tests/thunder-collection_LMS_API.json`
3. Start testing!

## Notes for Windows Users

### File Paths
- Use backslashes `\` or forward slashes `/` in Windows
- Example: `C:\Users\YourName\MERN_FREELANCE\server`

### Environment Variables
- `.env` files work the same way on Windows
- Make sure MongoDB URI is properly set in all service `.env` files

### Node.js Installation
- Use the LTS version from [nodejs.org](https://nodejs.org/)
- Verify installation: `node --version` and `npm --version`

### Terminal Recommendations
1. **Windows Terminal** (recommended) - Modern, supports colors
2. **PowerShell 7+** - Better than Windows PowerShell
3. **Git Bash** - Unix-like commands on Windows
4. **Command Prompt** - Basic, always available

## Next Steps

After all services are running:

1. ✅ Test API endpoints using Thunder Client
2. ✅ Connect your React frontend (update API_URL to `http://localhost:1001/api`)
3. ✅ Check MongoDB Atlas for created collections
4. ✅ Start developing!

## Support

- See main `README.md` for detailed API documentation
- See `API_DOCUMENTATION.md` for endpoint reference
- See `TESTING.md` for API testing examples
