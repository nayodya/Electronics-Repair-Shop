# Jenkins Pipeline - Simple Setup Guide

## 📋 Overview

This is a **simple Jenkins CI/CD pipeline** for the Electronics Repair Shop project. It automates:
- ✅ Code checkout
- ✅ Backend build (.NET 8)
- ✅ Frontend build (React)
- ✅ Testing
- ✅ Docker image creation
- ✅ Service deployment
- ✅ Smoke tests

## 🚀 Quick Start (3 Steps)

### Step 1: Start Jenkins
```bash
bash jenkins/scripts/setup-jenkins.sh
```

This will:
- Check Docker installation
- Start Jenkins container
- Display admin password
- Show next steps

**Wait for:** "Jenkins Setup Complete!" message

### Step 2: Configure Jenkins
1. Open browser: **http://localhost:8080**
2. Enter the admin password from the terminal
3. Click "Install suggested plugins" (takes ~5 min)
4. Create admin user account
5. Click "Start using Jenkins"

### Step 3: Create Pipeline Job
1. Click "New Item" (top left)
2. Enter name: `Electronics-Repair-Shop`
3. Select "Pipeline"
4. Click OK
5. Scroll to "Pipeline" section
6. Select "Pipeline script from SCM"
7. Choose "Git"
8. Repository URL: `https://github.com/nayodya/Electronics-Repair-Shop.git`
9. Branch: `*/main` (or your branch)
10. Script path: `Jenkinsfile`
11. Click Save
12. Click "Build Now"

**First build will take:** ~15-20 minutes (downloads dependencies)

## 📊 Pipeline Stages

The `Jenkinsfile` defines these stages:

| # | Stage | Purpose | Duration |
|---|-------|---------|----------|
| 1 | Checkout | Clone repository | 30s |
| 2 | Environment Setup | Verify Docker, .NET, Node | 10s |
| 3 | Build Backend | Compile .NET code | 3-5 min |
| 4 | Build Frontend | Build React app | 2-3 min |
| 5 | Backend Tests | Run unit tests | 1-2 min |
| 6 | Build Docker Images | Create containers | 2-3 min |
| 7 | Security Scan | Check vulnerabilities | 1 min |
| 8 | Deploy to Docker | Start services | 10s |
| 9 | Smoke Tests | Test endpoints | 20s |
| 10 | Generate Report | Summary | 10s |

**Total Time:** 15-20 minutes

## 🐳 Docker Setup

### Run Jenkins Only
```bash
docker-compose -f jenkins/docker-compose-jenkins-simple.yml up -d
```

### View Jenkins Logs
```bash
docker logs -f jenkins-master
```

### Stop Jenkins
```bash
docker-compose -f jenkins/docker-compose-jenkins-simple.yml down
```

### Full Reset (remove all data)
```bash
docker-compose -f jenkins/docker-compose-jenkins-simple.yml down -v
```

## 📝 What Gets Built

### Docker Images Created
- `electronics-repair-backend:BUILD_NUMBER`
- `electronics-repair-backend:latest`
- `electronics-repair-frontend:BUILD_NUMBER`
- `electronics-repair-frontend:latest`

### Example
```
Build #1:
  - electronics-repair-backend:1
  - electronics-repair-backend:latest
  - electronics-repair-frontend:1
  - electronics-repair-frontend:latest
```

## 🔗 Access Points After Build

| Service | URL | Purpose |
|---------|-----|---------|
| Jenkins | http://localhost:8080 | Pipeline dashboard |
| Backend | http://localhost:5062 | API endpoints |
| Swagger | http://localhost:5062/swagger | API documentation |
| Frontend | http://localhost:5173 | Web application |

## 🛑 Troubleshooting

### Jenkins won't start
```bash
# Check if port 8080 is in use
netstat -tulpn | grep 8080

# View logs
docker logs jenkins-master

# Force remove and restart
docker rm -f jenkins-master
bash jenkins/scripts/setup-jenkins.sh
```

### Build fails
1. Click build number in Jenkins
2. Click "Console Output"
3. Scroll down to see error
4. Common issues:
   - Missing dependencies → Run `npm install` manually
   - Port in use → Change ports in docker-compose.yml
   - Out of disk space → Free up space or increase Docker allocation

### "Docker command not found" in build
This means Jenkins can't access Docker. Solutions:
```bash
# Option 1: Restart Jenkins (easiest)
docker-compose -f jenkins/docker-compose-jenkins-simple.yml restart jenkins-master

# Option 2: Check Docker socket permissions
docker exec jenkins-master chmod 666 /var/run/docker.sock
```

### Can't connect to backend/frontend
Check if docker-compose.yml services started:
```bash
docker-compose ps
```

## 🔧 Configuration Files

### Main Files
- `Jenkinsfile` - Pipeline definition
- `jenkins/docker-compose-jenkins-simple.yml` - Jenkins setup
- `docker-compose.yml` - Application services
- `jenkins/scripts/setup-jenkins.sh` - Quick setup

## 💾 Jenkins Data Storage

All Jenkins data is stored in Docker volume: `jenkins_data`
- Builds, logs, artifacts
- Plugins, configurations
- Credentials (if saved)

To backup:
```bash
docker cp jenkins-master:/var/jenkins_home ./jenkins-backup
```

## 🔐 Security Notes

⚠️ **This setup is for development/testing only**

For production:
- Run Jenkins on secure server
- Use HTTPS
- Configure authentication (LDAP, GitHub OAuth)
- Use secret management (HashiCorp Vault)
- Set up firewall rules
- Regular backups

## 📚 Next Steps

1. ✅ Build and test pipeline
2. ✅ Add GitHub webhook for auto-builds
3. ✅ Add email notifications
4. ✅ Set up multiple environments (dev, staging, prod)
5. ✅ Add SonarQube for code quality
6. ✅ Add deployment to Kubernetes

## 🆘 Still Having Issues?

### Check Docker installation
```bash
docker version
docker-compose version
```

### Verify project structure
```bash
ls -la backend/
ls -la frontend/
```

### Test manual build
```bash
cd backend && dotnet build
cd frontend && npm install && npm run build
```

### View all containers
```bash
docker ps -a
```

### Clean everything and restart
```bash
docker-compose down -v
docker-compose up --build
```

## 📞 Resources

- Jenkins Docs: https://www.jenkins.io/doc/
- Docker Docs: https://docs.docker.com/
- .NET Docs: https://learn.microsoft.com/dotnet/
- React Docs: https://react.dev/

---

**Ready to go?** Run: `bash jenkins/scripts/setup-jenkins.sh`
