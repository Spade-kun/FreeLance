# 📋 Cross-Platform Scripts Summary

All scripts are now available for **Linux**, **Mac**, and **Windows**!

## Available Scripts

### 1️⃣ Install Dependencies

Installs npm packages for all 7 microservices.

| Platform | Command |
|----------|---------|
| Linux/Mac | `./install-all.sh` |
| Windows PowerShell | `.\install-all.ps1` |
| Windows CMD | `install-all.bat` |

---

### 2️⃣ Start All Services

Starts all 7 microservices in background.

| Platform | Command |
|----------|---------|
| Linux/Mac | `./start-all.sh` |
| Windows PowerShell | `.\start-all.ps1` |
| Windows CMD | `start-all.bat` |

---

### 3️⃣ Stop All Services

Stops all running microservices.

| Platform | Command |
|----------|---------|
| Linux/Mac | `./stop-all.sh` |
| Windows PowerShell | `.\stop-all.ps1` |
| Windows CMD | `stop-all.bat` |

---

### 4️⃣ Check Service Status

Shows which services are running and their health status.

| Platform | Command |
|----------|---------|
| Linux/Mac | `./check-services.sh` |
| Windows PowerShell | `.\check-services.ps1` |
| Windows CMD | `check-services.bat` |

---

### 5️⃣ Test API (Linux/Mac only)

Creates sample data for testing.

| Platform | Command |
|----------|---------|
| Linux/Mac | `./test-api.sh` |
| Windows | Use Thunder Client extension |

---

## Files Created

### Linux/Mac Scripts (.sh)
- ✅ `install-all.sh`
- ✅ `start-all.sh`
- ✅ `stop-all.sh`
- ✅ `check-services.sh`
- ✅ `check-setup.sh`
- ✅ `test-api.sh`
- ✅ `test-auth.sh`

### Windows Batch Files (.bat)
- ✅ `install-all.bat`
- ✅ `start-all.bat`
- ✅ `stop-all.bat`
- ✅ `check-services.bat`

### Windows PowerShell Scripts (.ps1)
- ✅ `install-all.ps1`
- ✅ `start-all.ps1`
- ✅ `stop-all.ps1`
- ✅ `check-services.ps1`

### Documentation
- ✅ `WINDOWS_SETUP.md` - Complete Windows setup guide
- ✅ `QUICK_START.md` - Updated with cross-platform commands
- ✅ `README.md` - Updated with platform support info

---

## How It Works

### Linux/Mac Scripts
- Written in **bash**
- Use `npm` to start services
- Run services in background using `&`
- Store PIDs in `logs/*.pid` files
- Use `curl` for health checks

### Windows Batch Files
- Written in **batch script** (`.bat`)
- Use `cmd` and `start /B` for background processes
- Compatible with Windows Command Prompt
- Use `netstat` and `taskkill` for process management

### Windows PowerShell Scripts
- Written in **PowerShell** (`.ps1`)
- More modern and feature-rich than batch files
- Colored output with emojis
- Better error handling
- Use native PowerShell cmdlets
- **Recommended** for Windows users

---

## First-Time Setup (Windows PowerShell)

PowerShell requires enabling script execution:

```powershell
# Run once as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## Example Usage

### Linux/Mac
```bash
# Install, start, and check
./install-all.sh
./start-all.sh
./check-services.sh

# View logs
tail -f logs/auth-service.log

# Stop everything
./stop-all.sh
```

### Windows PowerShell
```powershell
# Install, start, and check
.\install-all.ps1
.\start-all.ps1
.\check-services.ps1

# View logs
Get-Content logs\auth-service.log -Tail 20 -Wait

# Stop everything
.\stop-all.ps1
```

### Windows CMD
```cmd
REM Install, start, and check
install-all.bat
start-all.bat
check-services.bat

REM View logs
type logs\auth-service.log

REM Stop everything
stop-all.bat
```

---

## Key Differences

| Feature | Linux/Mac | PowerShell | Batch |
|---------|-----------|------------|-------|
| Colored Output | ✅ Yes | ✅ Yes | ❌ Limited |
| Emojis | ✅ Yes | ✅ Yes | ❌ No |
| Error Handling | ✅ Good | ✅ Excellent | ⚠️ Basic |
| Health Checks | ✅ curl | ✅ Invoke-WebRequest | ❌ No |
| Process Management | ✅ Easy | ✅ Easy | ⚠️ Complex |

---

## Recommendations

- **Linux/Mac Users**: Use `.sh` scripts
- **Windows Users**: Use `.ps1` (PowerShell) scripts for best experience
- **Windows Legacy**: Use `.bat` if PowerShell is not available

---

## All Services Run On:

- 🌐 **API Gateway**: http://localhost:1001
- 🔐 **Auth Service**: http://localhost:1002
- 👥 **User Service**: http://localhost:1003
- 📚 **Course Service**: http://localhost:1004
- 📝 **Content Service**: http://localhost:1005
- ✍️ **Assessment Service**: http://localhost:1006
- 📊 **Report Service**: http://localhost:1007

---

## Next Steps

1. Choose your platform scripts
2. Run `install-all` to setup
3. Run `start-all` to launch services
4. Use Thunder Client to test API
5. Connect your React frontend!

See **WINDOWS_SETUP.md** for detailed Windows instructions.
