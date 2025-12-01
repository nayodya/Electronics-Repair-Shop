# Jenkins CI/CD Pipeline - Complete Implementation Guide

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Usage](#usage)
6. [Pipeline Stages](#pipeline-stages)
7. [Monitoring](#monitoring)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### 1. Prerequisites Check
```bash
bash jenkins/scripts/preflight-check.sh
```

### 2. Install Jenkins
```bash
bash jenkins/scripts/install-jenkins.sh
```

### 3. Access Jenkins
- **URL**: http://localhost:8080
- Get password: `docker exec jenkins-master cat /var/jenkins_home/secrets/initialAdminPassword`

### 4. Configure
- See [JENKINS_SETUP.md](./JENKINS_SETUP.md) for detailed configuration

### 5. Create Pipeline
- Repository: `https://github.com/nayodya/Electronics-Repair-Shop.git`
- Jenkinsfile: `Jenkinsfile`

---

## 📁 Project Structure

```
Electronics-Repair-Shop/
├── Jenkinsfile                     # Main pipeline
├── JENKINS_SETUP.md               # Setup guide
├── JENKINS_IMPLEMENTATION.md      # Implementation summary
├── .env.example                   # Environment variables template
│
└── jenkins/                       # Jenkins configuration directory
    ├── README.md                  # Detailed documentation
    ├── Jenkinsfile.multibranch    # Multi-branch pipeline
    ├── jenkins-config.yaml        # Jenkins configuration as code
    ├── docker-compose.yml         # Docker services stack
    ├── prometheus.yml             # Prometheus config
    ├── alerts.yml                 # Alert rules
    │
    ├── scripts/                   # Automation scripts
    │   ├── install-jenkins.sh     # Installation script
    │   ├── preflight-check.sh     # Environment verification
    │   ├── build.sh               # Build automation
    │   ├── test.sh                # Test execution
    │   ├── deploy.sh              # Deployment automation
    │   └── quality-gate.sh        # Quality enforcement
    │
    └── grafana/
        └── provisioning/          # Grafana dashboards
            ├── datasources/
            └── dashboards/
```

---

## 💻 Installation

### Option 1: Automated Installation
```bash
bash jenkins/scripts/install-jenkins.sh
```

This will:
- Install Docker if needed
- Create Jenkins stack
- Start all services
- Display initial credentials

### Option 2: Manual Docker Compose
```bash
cd jenkins
docker-compose up -d
```

### Verify Installation
```bash
# Check all services
docker-compose ps

# View Jenkins logs
docker-compose logs -f jenkins

# Test Jenkins
curl http://localhost:8080
```

---

## ⚙️ Configuration

### Step 1: Create .env File
```bash
cp .env.example .env
# Edit .env with your values
```

### Step 2: Configure Jenkins Credentials
1. Go to **Manage Jenkins** → **Manage Credentials**
2. Add credentials:
   - GitHub credentials
   - Docker registry credentials
   - SonarQube token
   - Slack webhook (optional)

### Step 3: Configure SonarQube
1. Access http://localhost:9000
2. Login (admin/admin)
3. Create project
4. Generate token

### Step 4: Configure GitHub Webhook
1. Go to repository settings
2. Add webhook:
   - URL: `http://your-jenkins/github-webhook/`
   - Events: Push, Pull Request

### Step 5: Create Pipeline Job
1. New Item → Pipeline
2. Configure:
   - Repository URL
   - Credentials
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

---

## 🎯 Usage

### Trigger Pipeline

**Manual Trigger:**
```bash
# Via Jenkins UI
Click "Build Now"

# Via Jenkins CLI
java -jar jenkins-cli.jar build "ERS-Main-Pipeline"
```

**Automatic Trigger:**
- Push to `main` → Production pipeline
- Push to `develop` → Development pipeline
- Create pull request → Testing pipeline

### Monitor Build

1. Click build number in Jenkins UI
2. View "Console Output"
3. Check individual stages
4. Review reports

### Access Reports

**SonarQube Analysis:**
- http://localhost:9000

**Grafana Dashboards:**
- http://localhost:3000

**Build Artifacts:**
- Jenkins UI → Build → Artifacts

---

## 🔄 Pipeline Stages

### Main Pipeline (Jenkinsfile)

| Stage | Purpose | Duration |
|-------|---------|----------|
| Checkout | Clone repository | 1-2 min |
| Environment Check | Verify tools | 1 min |
| Build Backend | .NET build | 3-5 min |
| Build Frontend | React build | 3-5 min |
| Testing | Unit & integration tests | 5-10 min |
| Code Quality | SonarQube analysis | 2-3 min |
| Security Scanning | Trivy, SAST, secrets | 3-5 min |
| Docker Build | Build images | 2-3 min |
| Registry Push | Push to Docker Hub | 1-2 min |
| Deployment | Deploy to environment | 2-3 min |
| Smoke Tests | Verify deployment | 1-2 min |
| Reports | Generate reports | 1 min |

**Total Time: ~25-35 minutes**

### Multi-branch Pipeline (Jenkinsfile.multibranch)

Enhanced with:
- Parallel execution
- Advanced security
- Performance testing
- SAST analysis

---

## 📊 Monitoring

### Dashboards

**Jenkins Dashboard**
- URL: http://localhost:8080
- Shows: Build history, status, metrics

**SonarQube Dashboard**
- URL: http://localhost:9000
- Shows: Code quality, coverage, vulnerabilities

**Grafana**
- URL: http://localhost:3000
- Shows: Metrics, trends, custom dashboards

**Prometheus**
- URL: http://localhost:9090
- Shows: Raw metrics, alerts

### Alerts

Configured alerts for:
- ✓ Build failures
- ✓ Low code coverage (<70%)
- ✓ Critical vulnerabilities
- ✓ Agent offline
- ✓ High memory usage
- ✓ Low disk space

---

## 🔐 Security

### Built-in Security Features

1. **Container Scanning (Trivy)**
   - Scans Docker images
   - Identifies CVEs
   - Blocks on critical issues

2. **SAST Analysis (Semgrep)**
   - Source code analysis
   - Security pattern detection

3. **Dependency Checking**
   - npm audit
   - dotnet package scan

4. **Secret Detection**
   - Credential scanning
   - Prevent leaks

5. **Quality Gates**
   - Code coverage: ≥70%
   - Vulnerabilities: 0
   - Test pass rate: 100%

---

## 🐛 Troubleshooting

### Jenkins Won't Start
```bash
# Check logs
docker-compose logs jenkins

# Check port
lsof -i :8080

# Restart
docker-compose restart jenkins
```

### Build Fails
1. Check "Console Output"
2. Verify credentials
3. Check logs: `docker-compose logs`
4. Review stage errors

### Docker Push Failed
```bash
# Verify credentials
docker login

# Check image
docker images | grep electronics-repair

# Manual push
docker push docker.io/your-user/electronics-repair-backend:latest
```

### SonarQube Connection Failed
```bash
# Check SonarQube
curl http://localhost:9000

# Check token
curl -u admin:admin http://localhost:9000/api/authentication/validate

# Verify credentials in Jenkins
```

See [JENKINS_SETUP.md](./JENKINS_SETUP.md) for detailed troubleshooting.

---

## 📚 Documentation Files

| File | Purpose |
|------|---------|
| **JENKINS_SETUP.md** | Complete setup guide |
| **JENKINS_IMPLEMENTATION.md** | Implementation summary |
| **jenkins/README.md** | Pipeline documentation |
| **jenkins/scripts/*.sh** | Script documentation |
| **.env.example** | Environment variables template |

---

## 🔧 Common Tasks

### Add New Pipeline Stage

Edit `Jenkinsfile`:
```groovy
stage('My New Stage') {
    steps {
        script {
            sh 'echo "Running new stage..."'
        }
    }
}
```

### Add New Credential

Jenkins UI → Manage Credentials → Add Credentials

### Update Docker Image

```bash
docker pull jenkins/jenkins:lts-jdk17
docker-compose restart jenkins
```

### View Service Logs

```bash
docker-compose logs -f [service-name]
# Examples: jenkins, sonarqube, postgres, grafana
```

### Backup Jenkins Data

```bash
docker exec jenkins-master tar czf /tmp/backup.tar.gz /var/jenkins_home
docker cp jenkins-master:/tmp/backup.tar.gz ./jenkins-backup.tar.gz
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Jenkins accessible at http://localhost:8080
- [ ] SonarQube accessible at http://localhost:9000
- [ ] Grafana accessible at http://localhost:3000
- [ ] Prometheus accessible at http://localhost:9090
- [ ] All credentials configured
- [ ] GitHub webhook working
- [ ] Pipeline job created
- [ ] Test build successful
- [ ] Reports generated
- [ ] Alerts active

---

## 📞 Quick Reference

### Service URLs
- Jenkins: http://localhost:8080
- SonarQube: http://localhost:9000
- Grafana: http://localhost:3000
- Prometheus: http://localhost:9090

### Default Credentials
- Grafana: admin / AdminPassword123
- SonarQube: admin / admin (change after setup)

### Useful Commands
```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f jenkins

# Run script
bash jenkins/scripts/build.sh

# Check prerequisites
bash jenkins/scripts/preflight-check.sh
```

---

## 🎓 Learning Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

---

## 🤝 Contributing

To improve the Jenkins setup:

1. Update relevant script files
2. Test changes locally
3. Update documentation
4. Create pull request

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 2025 | Initial release |

---

## 📞 Support

For issues or questions:
- Check documentation files
- Review troubleshooting section
- Check pipeline logs
- Create GitHub issue

---

**Jenkins CI/CD Setup Complete!** ✅

Ready to build, test, and deploy your Electronics Repair Shop application automatically.

Start with: `bash jenkins/scripts/preflight-check.sh`
