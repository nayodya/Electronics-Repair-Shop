# 🚀 Jenkins Quick Reference

## One-Minute Setup (Windows)

```batch
jenkins/scripts/setup-jenkins.bat
```

Then visit: **http://localhost:8080**

## One-Minute Setup (Mac/Linux)

```bash
bash jenkins/scripts/setup-jenkins.sh
```

Then visit: **http://localhost:8080**

---

## 🎯 Common Tasks

### View Build Logs
```
Jenkins Dashboard → Click Build Number → Console Output
```

### Rebuild Last Build
```
Jenkins Dashboard → Click Build Number → Rebuild
```

### Rebuild Specific Commit
```
Jenkins Dashboard → Build with Parameters → Git Commit ID
```

### Stop Jenkins
```bash
docker-compose -f jenkins/docker-compose-jenkins-simple.yml down
```

### Start Jenkins Again
```bash
docker-compose -f jenkins/docker-compose-jenkins-simple.yml up -d
```

### See Jenkins Status
```bash
docker-compose -f jenkins/docker-compose-jenkins-simple.yml ps
```

### View Jenkins Logs
```bash
docker logs -f jenkins-master
```

### Get Admin Password (if lost)
```bash
docker exec jenkins-master cat /var/jenkins_home/secrets/initialAdminPassword
```

---

## 📊 What Each Stage Does

| Stage | What Happens |
|-------|-------------|
| **Checkout** | Clones code from GitHub |
| **Environment Setup** | Checks Docker, .NET, Node versions |
| **Build Backend** | Compiles C# code with `dotnet build` |
| **Build Frontend** | Builds React app with `npm run build` |
| **Backend Tests** | Runs unit tests with `dotnet test` |
| **Build Docker Images** | Creates Docker images for backend & frontend |
| **Security Scan** | Checks for vulnerable packages |
| **Deploy to Docker** | Starts services with docker-compose |
| **Smoke Tests** | Tests if services are responding |
| **Generate Report** | Shows build summary |

---

## 🔧 First-Time Setup

### 1. Start Jenkins
```bash
# Windows
jenkins/scripts/setup-jenkins.bat

# Mac/Linux
bash jenkins/scripts/setup-jenkins.sh
```

### 2. Open Jenkins
Visit: http://localhost:8080

### 3. Enter Admin Password
- Copy password from terminal
- Paste into Jenkins
- Click Continue

### 4. Install Plugins
- Click "Install suggested plugins"
- Wait ~5 minutes

### 5. Create Admin User
- Fill in username/password
- Click "Save and Continue"
- Click "Save and Finish"

### 6. Create Job
- Click "New Item"
- Name: `Electronics-Repair-Shop`
- Type: "Pipeline"
- Click OK

### 7. Configure Job
- Select "Pipeline script from SCM"
- Choose "Git"
- Paste: `https://github.com/nayodya/Electronics-Repair-Shop.git`
- Script path: `Jenkinsfile`
- Click Save

### 8. Build!
- Click "Build Now"
- Watch the console output

---

## 🔗 URLs During Build

| Service | URL |
|---------|-----|
| Jenkins | http://localhost:8080 |
| Backend API | http://localhost:5062 |
| Backend Swagger | http://localhost:5062/swagger |
| Frontend | http://localhost:5173 |

---

## 🐛 Common Issues

### "Docker command not found"
```bash
# Restart Jenkins
docker-compose -f jenkins/docker-compose-jenkins-simple.yml restart jenkins-master
```

### "Port 8080 already in use"
```bash
# On Windows
netstat -ano | findstr :8080

# On Mac/Linux
lsof -i :8080

# Kill process or change port in docker-compose-jenkins-simple.yml
```

### "Build never finishes"
```bash
# Check logs
docker logs -f jenkins-master

# May be downloading dependencies for first time - wait 15+ minutes
```

### Jenkins won't start
```bash
# Check Docker is running
docker ps

# View full logs
docker logs jenkins-master

# Hard reset
docker-compose -f jenkins/docker-compose-jenkins-simple.yml down -v
bash jenkins/scripts/setup-jenkins.sh
```

---

## 📝 Files Created

```
Jenkinsfile                                   # Pipeline definition
jenkins/
  ├── docker-compose-jenkins-simple.yml      # Jenkins Docker setup
  └── scripts/
      ├── setup-jenkins.sh                   # Linux/Mac setup
      └── setup-jenkins.bat                  # Windows setup
JENKINS_SIMPLE_SETUP.md                       # Full guide (this file)
```

---

## 🎓 What Happens in Build

1. **Checkout** → Clones your repo
2. **Build Backend** → Compiles .NET code
3. **Build Frontend** → Bundles React app
4. **Tests** → Runs unit tests
5. **Docker Images** → Creates containers for backend & frontend
6. **Deploy** → Starts all services
7. **Smoke Tests** → Verifies services are running
8. **Report** → Shows results

**Total time:** 15-20 minutes (first build slower)

---

## ⚡ Performance Tips

- **First build is slow** → Downloads dependencies (15-20 min)
- **Subsequent builds are faster** → 8-12 minutes
- **Use SSD** → Faster compilation and I/O
- **Allocate enough RAM** → At least 4GB to Docker

---

## 🔐 Security Notes

⚠️ **Development Only!**

This setup is for development/testing. For production:
- Use HTTPS/SSL
- Add authentication
- Run on secure infrastructure
- Regular backups
- Use secrets management
- Set up firewall rules

---

## 📚 Learn More

- Full setup guide: `JENKINS_SIMPLE_SETUP.md`
- Jenkins docs: https://www.jenkins.io/
- Docker docs: https://docs.docker.com/
- Your project: `README.md`

---

**Ready?** → Run the setup script for your OS!
