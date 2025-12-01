# 🪟 Jenkins Setup Guide for Windows (Docker Desktop)

## Prerequisites Check

### Required Software (Windows)
```
✓ Windows 10/11 (64-bit)
✓ Docker Desktop for Windows
✓ At least 8GB RAM (recommended)
✓ 10GB free disk space
```

### Installation Verification
```batch
REM Open Command Prompt and run these commands:

REM Check Docker
docker --version
REM Expected: Docker version 24.x.x or higher

REM Check Docker Compose
docker-compose --version
REM Expected: Docker Compose version 2.x.x or higher

REM Check Docker is running
docker ps
REM Expected: Shows running containers (or empty list)
```

If any of these fail:
1. **Install Docker Desktop**: https://www.docker.com/products/docker-desktop
2. **Restart your computer**
3. **Try again**

---

## ⚡ One-Command Quick Start

Open **Command Prompt** or **PowerShell** and run:

```batch
cd "E:\Electronics Repair Shop"
jenkins\scripts\setup-jenkins.bat
```

**Wait for message:** "Setup complete!"

Then visit: **http://localhost:8080**

---

## 🎯 What the Setup Script Does

The `setup-jenkins.bat` script automatically:

1. ✅ Checks if Docker is installed
2. ✅ Checks if Docker daemon is running
3. ✅ Starts Jenkins container
4. ✅ Waits for Jenkins to initialize (~60 seconds)
5. ✅ Retrieves admin password
6. ✅ Displays instructions
7. ✅ Shows all URLs and commands

---

## 📋 Step-by-Step Manual Setup (If Preferred)

### Step 1: Verify Docker Desktop is Running
1. Open **Docker Desktop** application
2. Wait for Docker icon in taskbar to show it's ready
3. Open **Command Prompt** and verify:
```batch
docker ps
```

Should show a list (possibly empty).

### Step 2: Navigate to Project
```batch
cd "E:\Electronics Repair Shop"
```

### Step 3: Start Jenkins
```batch
docker-compose -f jenkins/docker-compose-jenkins-simple.yml up -d
```

**Output:** Shows container starting
```
Creating jenkins-master ... done
```

### Step 4: Wait for Jenkins (60 seconds)
```batch
REM Wait approximately 60 seconds, then check if ready:
curl http://localhost:8080
```

If you get a response, Jenkins is running!

### Step 5: Get Admin Password
```batch
docker exec jenkins-master cat /var/jenkins_home/secrets/initialAdminPassword
```

**Copy the password shown** (20+ character string)

### Step 6: Open Jenkins
1. Open browser: **http://localhost:8080**
2. Paste the admin password
3. Click Continue

---

## 🔑 Initial Jenkins Configuration (One-Time)

### Step 1: Unlock Jenkins (Immediate)
- Paste admin password from previous step
- Click "Continue"

### Step 2: Install Plugins (5 minutes)
- Click "Install suggested plugins"
- Wait for all plugins to install (shows progress)
- Coffee break! ☕

### Step 3: Create Admin User
- **Username:** (choose one, e.g., `admin`)
- **Password:** (create a strong password)
- **Full name:** (your name)
- **Email:** (your email)
- Click "Save and Continue"

### Step 4: Configure Instance
- **Jenkins URL:** http://localhost:8080
- Click "Save and Finish"

### Step 5: Start Using Jenkins
- Click "Start using Jenkins"
- You're in! 🎉

---

## 🔨 Create Your First Pipeline Job

### Step 1: New Job
1. Click **"New Item"** (top left)
2. **Job name:** `Electronics-Repair-Shop`
3. **Job type:** Select "Pipeline"
4. Click **OK**

### Step 2: Configure Pipeline
1. Scroll to "Pipeline" section
2. **Definition:** Select "Pipeline script from SCM"
3. **SCM:** Select "Git"
4. **Repository URL:** 
```
https://github.com/nayodya/Electronics-Repair-Shop.git
```
5. **Branch:** `*/main` (or your branch)
6. **Script path:** `Jenkinsfile`

### Step 3: Save and Build
1. Click **Save**
2. Click **"Build Now"** (left menu)
3. Watch the build! Click the build number to see progress

---

## ⏱️ Build Times on Windows

| Build Type | Time | Notes |
|-----------|------|-------|
| First Build | 20-25 min | Downloads all dependencies |
| Clean Build | 15-18 min | With cached dependencies |
| Incremental | 8-12 min | Only changed files |
| Average | ~15 min | Typical build |

**Note:** SSD is MUCH faster than HDD. If using HDD, add 5-10 minutes.

---

## 🐳 Docker Desktop on Windows - Tips

### Memory Allocation
1. Open **Docker Desktop Settings**
2. Go to **Resources**
3. Set **Memory:** 4GB minimum (8GB recommended)
4. Click **Apply & Restart**

### Disk Space
1. Docker Desktop needs space for:
   - Jenkins images: ~500MB
   - Application images: ~800MB
   - Build artifacts: 1-2GB
   - **Total:** At least 5GB free recommended

### File Sharing
If your project is on a network drive:
1. **Docker Desktop Settings → Resources → File Sharing**
2. Add your drive path
3. Apply changes

---

## 🔄 Common Tasks on Windows

### View Build Logs
```batch
REM Real-time logs
docker logs -f jenkins-master

REM Last 50 lines
docker logs --tail=50 jenkins-master
```

### Stop Jenkins
```batch
docker-compose -f jenkins/docker-compose-jenkins-simple.yml down
```

### Start Jenkins Again
```batch
docker-compose -f jenkins/docker-compose-jenkins-simple.yml up -d
```

### Check Status
```batch
docker-compose -f jenkins/docker-compose-jenkins-simple.yml ps
```

### Access Jenkins Shell
```batch
docker exec -it jenkins-master bash
```

### Remove Everything and Start Fresh
```batch
docker-compose -f jenkins/docker-compose-jenkins-simple.yml down -v
jenkins\scripts\setup-jenkins.bat
```

---

## 🪟 Windows-Specific Issues

### Issue 1: "Docker is not running"
**Solution:**
1. Open Docker Desktop application (from Start menu)
2. Wait for whale icon in taskbar to appear
3. Try again: `docker ps`

### Issue 2: "Port 8080 already in use"
**Solution:**
```batch
REM Find what's using port 8080
netstat -ano | findstr :8080

REM This shows: TCP ... LISTENING ... (PID)
REM Kill the process:
taskkill /PID <PROCESS_ID> /F

REM Or change port in docker-compose-jenkins-simple.yml
REM Change "8080:8080" to "8090:8080"
```

### Issue 3: "Docker failed to initialize"
**Solution:**
1. Restart Docker Desktop
2. Restart your computer
3. Reinstall Docker Desktop if problem persists

### Issue 4: "Build hanging on npm install"
**Solution:**
1. Increase Docker Desktop memory (see Docker Desktop Settings)
2. Increase Docker Desktop disk size
3. Try: `docker system prune -a` (to clean up)

### Issue 5: "Slow builds on Windows"
**Solutions (in order of effectiveness):**
1. Use SSD instead of HDD
2. Allocate more CPU cores to Docker Desktop
3. Allocate more RAM to Docker Desktop
4. Disable Windows Defender for `C:\` during builds
5. Use WSL 2 backend (Docker Desktop settings)

### Issue 6: "Git command not found in build"
**Solution:**
```batch
REM Jenkins needs git in PATH
REM Install Git from: https://git-scm.com/download/win

REM Verify:
git --version

REM Restart Docker:
docker-compose -f jenkins/docker-compose-jenkins-simple.yml restart jenkins-master
```

---

## 🎓 PowerShell vs Command Prompt

You can use either, but **Command Prompt (cmd.exe)** is recommended for this project.

### If using PowerShell:
```powershell
# Use this syntax:
cd "E:\Electronics Repair Shop"
& jenkins/scripts/setup-jenkins.bat

# Or use bash if you have Git Bash installed:
bash jenkins/scripts/setup-jenkins.sh
```

### For Command Prompt (Recommended):
```batch
cd "E:\Electronics Repair Shop"
jenkins\scripts\setup-jenkins.bat
```

---

## 🔒 Windows Defender / Antivirus

If builds are slow or fail:

1. Add Docker Desktop to exclusions
2. Add your project folder to exclusions
3. Temporarily disable scanning during first build

⚠️ **Warning:** Only do this in development environment!

---

## 🚀 Performance Optimization for Windows

### Optimization 1: WSL 2 Backend
1. **Docker Desktop Settings → General**
2. Check "Use WSL 2 based engine"
3. Restart Docker
4. **Result:** ~30% faster builds

### Optimization 2: Memory Allocation
1. **Docker Desktop Settings → Resources**
2. Set **Memory** to 8GB (or 75% of your RAM)
3. Set **CPU** to 4 cores (if available)
4. Click **Apply & Restart**
5. **Result:** ~20% faster builds

### Optimization 3: Disk Location
1. Keep project on **fast SSD**
2. Avoid network drives
3. Avoid OneDrive sync folder
4. **Result:** ~50% faster I/O

---

## 📊 Windows System Requirements

### Minimum (Works But Slow)
- Windows 10/11
- 6GB RAM
- 2 CPU cores
- HDD storage

### Recommended (Good Performance)
- Windows 10/11
- 8GB+ RAM
- 4+ CPU cores
- SSD storage (250GB+)

### Ideal (Fast Builds)
- Windows 11 (latest)
- 16GB+ RAM
- 6+ CPU cores
- NVMe SSD storage

---

## 🔄 Daily Workflow on Windows

### Start of Day
```batch
REM Open Command Prompt
cd "E:\Electronics Repair Shop"

REM Verify Jenkins is running
docker-compose -f jenkins/docker-compose-jenkins-simple.yml ps

REM If not running:
docker-compose -f jenkins/docker-compose-jenkins-simple.yml up -d

REM Open Jenkins
start http://localhost:8080
```

### During Development
1. Make code changes
2. Push to GitHub: `git push`
3. Jenkins automatically builds
4. Check dashboard: http://localhost:8080
5. View logs if build fails

### End of Day
```batch
REM Optional: Stop Jenkins to free resources
docker-compose -f jenkins/docker-compose-jenkins-simple.yml down

REM Or leave running for automated builds
```

---

## 🆘 Emergency Troubleshooting

### Nuclear Option (Last Resort)
```batch
REM Stop everything
docker-compose -f jenkins/docker-compose-jenkins-simple.yml down -v

REM Clean up unused Docker resources
docker system prune -a --volumes

REM Restart from fresh
jenkins\scripts\setup-jenkins.bat
```

### Verify Git Configuration
```batch
git config --list
git config user.name "Your Name"
git config user.email "your@email.com"
```

### Check Disk Space
```batch
REM Show disk usage
dir C:\ | findstr "drive"

REM Or use Storage Sense in Windows Settings
```

### View All Logs
```batch
REM Jenkins logs
docker logs -f jenkins-master

REM Docker events (troubleshooting)
docker events

REM Full system logs
docker system df
```

---

## 📞 When All Else Fails

### Restart Sequence
1. Stop Docker Desktop
2. Wait 10 seconds
3. Restart Docker Desktop
4. Wait for whale icon
5. Try build again

### Reinstall Sequence
1. Uninstall Docker Desktop
2. Restart computer
3. Delete `C:\Users\<YourUsername>\AppData\Local\Docker`
4. Reinstall Docker Desktop
5. Run setup script

### Check Windows Event Viewer
1. Press `Win + R`
2. Type `eventvwr.msc`
3. Check **Windows Logs → System** for Docker errors

---

## ✅ Verification Checklist (Windows)

- [ ] Docker Desktop installed and running
- [ ] `docker ps` works in Command Prompt
- [ ] Project files visible in Explorer
- [ ] `jenkins\scripts\setup-jenkins.bat` executable
- [ ] Jenkins accessible at http://localhost:8080
- [ ] First build completed successfully
- [ ] All services running: `docker-compose ps`
- [ ] No port conflicts (port 8080 available)
- [ ] At least 5GB free disk space
- [ ] Antivirus not interfering

---

## 🎯 Quick Reference - Windows Commands

```batch
REM Setup & Start
jenkins\scripts\setup-jenkins.bat

REM View status
docker-compose -f jenkins/docker-compose-jenkins-simple.yml ps

REM View logs
docker logs -f jenkins-master

REM Stop everything
docker-compose -f jenkins/docker-compose-jenkins-simple.yml down

REM Start again
docker-compose -f jenkins/docker-compose-jenkins-simple.yml up -d

REM Get admin password
docker exec jenkins-master cat /var/jenkins_home/secrets/initialAdminPassword

REM Full reset
docker-compose -f jenkins/docker-compose-jenkins-simple.yml down -v

REM Check disk usage
docker system df

REM Clean up
docker system prune -a

REM Open Jenkins in browser
start http://localhost:8080

REM Get project statistics
dir /s
```

---

## 🎉 You're Ready!

Run this now:
```batch
jenkins\scripts\setup-jenkins.bat
```

Then visit: **http://localhost:8080**

---

**Created:** December 1, 2025  
**Platform:** Windows 10/11 with Docker Desktop  
**Status:** ✅ Ready to Use  

For more info, see:
- `JENKINS_QUICK_START.md` - Universal quick start
- `JENKINS_SIMPLE_SETUP.md` - Complete guide
- `JENKINS_DOCUMENTATION_INDEX.md` - Documentation map
