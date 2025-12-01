# Jenkins Setup and Configuration Guide

## 🎯 Quick Start Guide

### Step 1: Install Jenkins with Docker

```bash
cd jenkins/scripts
bash install-jenkins.sh
```

**What this does:**
- Installs Docker if needed
- Creates `/opt/jenkins` directory
- Generates `docker-compose.yml`
- Starts Jenkins, SonarQube, PostgreSQL, Grafana, and Prometheus
- Displays initial admin password

### Step 2: First Access

1. **Open Jenkins Dashboard**
   ```
   http://localhost:8080
   ```

2. **Retrieve Admin Password**
   ```bash
   docker exec jenkins-master cat /var/jenkins_home/secrets/initialAdminPassword
   ```

3. **Complete Initial Setup**
   - Enter admin password
   - Install recommended plugins
   - Create first admin user

### Step 3: Configure Credentials

#### Add GitHub Credentials

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click on **global** domain
3. Click **Add Credentials**
4. Select **Username and password**
5. Enter:
   - Username: `your-github-username`
   - Password: `your-github-personal-token`
   - ID: `github-credentials`
6. Click **Create**

#### Add Docker Registry Credentials

1. Click **Add Credentials**
2. Select **Username and password**
3. Enter:
   - Username: `your-docker-username`
   - Password: `your-docker-password`
   - ID: `docker-registry-credentials`
4. Click **Create**

#### Add SonarQube Token

1. Click **Add Credentials**
2. Select **Secret text**
3. Enter SonarQube token
4. ID: `sonarqube-token`

### Step 4: Configure GitHub Webhook

1. Go to your GitHub repository
2. **Settings** → **Webhooks** → **Add webhook**
3. Configure:
   - **Payload URL**: `http://your-jenkins-url/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Send me everything
   - **Active**: ✓ Checked
4. **Add webhook**

### Step 5: Create Pipeline Job

#### Method 1: Using Web Interface

1. Click **New Item**
2. Enter name: `ERS-Main-Pipeline`
3. Select **Pipeline**
4. Click **OK**
5. Under **Pipeline** section:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/nayodya/Electronics-Repair-Shop.git`
   - Credentials: Select `github-credentials`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`
6. Click **Save**

#### Method 2: Using Multibranch Pipeline

1. Click **New Item**
2. Enter name: `ERS-Multibranch`
3. Select **Multibranch Pipeline**
4. Click **OK**
5. Under **Branch Sources**:
   - Click **Add source** → **Git**
   - Project Repository: `https://github.com/nayodya/Electronics-Repair-Shop.git`
   - Credentials: Select `github-credentials`
6. Under **Behaviors**:
   - Keep **Discover branches**
   - Keep **Discover pull requests from origin**
7. Click **Save**

## 🔧 Pipeline Configuration

### Environment Variables

Create `.env` file in project root:

```bash
# GitHub
GITHUB_USERNAME=your-username
GITHUB_TOKEN=your-personal-token

# Docker
DOCKER_REGISTRY=docker.io
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password

# Database
SA_PASSWORD=YourStrong@Passw0rd
DB_NAME=ElectronicsRepairShop

# SonarQube
SONARQUBE_HOST_URL=http://localhost:9000
SONARQUBE_TOKEN=your-sonarqube-token
SONARQUBE_WEBHOOK_SECRET=your-webhook-secret

# Slack (Optional)
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/YOUR/WEBHOOK/URL

# Email (Optional)
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
```

### Jenkins Global Configuration

1. Go to **Manage Jenkins** → **Configure System**

2. **Jenkins Location**
   - Jenkins URL: `http://your-server:8080/`

3. **Email Notification**
   - SMTP server: `smtp.gmail.com`
   - SMTP port: `587`
   - Check **Use SMTP Authentication**
   - Username: `your-email@gmail.com`
   - Password: `your-app-password`
   - Check **Use TLS**

4. **SonarQube Servers**
   - Name: `SonarQube`
   - Server URL: `http://localhost:9000`
   - Server authentication token: Your SonarQube token

5. Click **Save**

## 📊 SonarQube Setup

### Initial Configuration

1. **Access SonarQube**
   ```
   http://localhost:9000
   ```

2. **Default Login**
   - Username: `admin`
   - Password: `admin`

3. **Create Project**
   - Click **Create project**
   - Enter project key: `electronics-repair-shop`
   - Click **Set up**

4. **Generate Token**
   - Go to **My Account** → **Security** → **Generate Tokens**
   - Token name: `Jenkins`
   - Click **Generate**
   - Copy token and save as Jenkins credential

### Quality Gate Configuration

1. Go to **Quality Gates**
2. Create new quality gate: `ERS-Quality-Gate`
3. Add conditions:
   - Coverage: >= 70%
   - Duplicated Lines: < 5%
   - Bugs: = 0
   - Vulnerabilities: = 0

4. Set as default for project

## 🚨 Monitoring and Alerts

### Grafana Dashboards

1. **Access Grafana**
   ```
   http://localhost:3000
   ```

2. **Default Login**
   - Username: `admin`
   - Password: `AdminPassword123`

3. **Add Data Source**
   - Click **Configuration** → **Data Sources**
   - Click **Add data source**
   - Select `Prometheus`
   - URL: `http://prometheus:9090`
   - Click **Save & Test**

4. **Create Dashboards**
   - Import dashboard
   - Dashboard ID: `10644` (Jenkins metrics)
   - Select Prometheus as data source

### Prometheus Alerting

Alerts are configured in `alerts.yml`:

- **Jenkins Build Failure**: Triggers on failed builds
- **Code Coverage**: Alerts if coverage < 70%
- **Vulnerabilities**: Alerts on critical vulnerabilities
- **Infrastructure**: CPU, memory, disk alerts

## 🔒 Security Best Practices

### 1. Change Default Passwords

```bash
# Jenkins
- Update admin password in UI

# SonarQube
curl -u admin:admin -X POST "http://localhost:9000/api/users/change_password" \
  -d "login=admin" -d "previousPassword=admin" -d "password=NewPassword123"

# Grafana
- Update admin password in UI
```

### 2. Configure Jenkins Security

1. **Manage Jenkins** → **Security**
   - Enable CSRF Protection
   - Enable Script Security

2. **Configure Matrix Authorization**
   - Select **Matrix-based security**
   - Add user groups with appropriate permissions

### 3. SSL/TLS Configuration

Generate self-signed certificate:

```bash
openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
```

Update `jenkins/docker-compose.yml`:

```yaml
jenkins:
  ports:
    - "8443:8443"
  volumes:
    - ./key.pem:/var/jenkins_home/key.pem:ro
    - ./cert.pem:/var/jenkins_home/cert.pem:ro
  environment:
    - JENKINS_OPTS=--httpPort=-1 --httpsPort=8443 --httpsKeyStore=/var/jenkins_home/key.pem --httpsKeyStorePassword=jenkins
```

## 📈 Pipeline Execution

### Trigger Pipeline

#### Manual Trigger

1. Go to pipeline job
2. Click **Build Now**

#### Automatic Trigger

- Push to `main` branch → Production pipeline
- Push to `develop` branch → Development pipeline
- Push to `feature/*` → Feature branch testing

### Monitor Build

1. Click build number
2. View **Console Output**
3. Check individual stage logs
4. Download artifacts

## 🐛 Troubleshooting

### Jenkins Won't Start

```bash
# Check logs
cd /opt/jenkins
docker-compose logs -f jenkins

# Check port
lsof -i :8080

# Restart
docker-compose down
docker-compose up -d
```

### Build Fails at Checkout

- Verify GitHub credentials
- Check repository URL
- Verify SSH/HTTPS access
- Check webhook configuration

### Docker Push Fails

```bash
# Verify credentials
docker login -u your-username

# Check image name
docker images | grep electronics-repair

# Manual push for testing
docker push docker.io/your-username/electronics-repair-backend:latest
```

### SonarQube Connection Failed

```bash
# Check SonarQube is running
docker-compose ps sonarqube

# Check connectivity
curl http://localhost:9000

# Verify token
curl -u admin:admin http://localhost:9000/api/authentication/validate
```

## 📚 Useful Commands

### Jenkins CLI

```bash
# Get Jenkins version
curl http://localhost:8080/api/json | jq .version

# List jobs
java -jar jenkins-cli.jar -s http://localhost:8080 list-jobs

# Trigger build
java -jar jenkins-cli.jar -s http://localhost:8080 build "ERS-Main-Pipeline"
```

### Docker Management

```bash
# View Jenkins logs
docker-compose logs -f jenkins

# Access Jenkins container
docker-compose exec jenkins bash

# Clean up
docker-compose down -v
```

## 🔄 Backup and Recovery

### Backup Jenkins

```bash
# Backup Jenkins home
docker exec jenkins-master tar czf /tmp/jenkins-backup.tar.gz /var/jenkins_home

# Copy backup
docker cp jenkins-master:/tmp/jenkins-backup.tar.gz ./jenkins-backup.tar.gz
```

### Restore Jenkins

```bash
# Stop Jenkins
docker-compose down

# Restore backup
tar xzf jenkins-backup.tar.gz -C /opt/jenkins/jenkins_home/

# Start Jenkins
docker-compose up -d
```

## 📖 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [SonarQube Configuration](https://docs.sonarqube.org/)
- [Kubernetes Integration](https://plugins.jenkins.io/kubernetes/)

## ✅ Verification Checklist

After setup, verify:

- [ ] Jenkins is accessible at http://localhost:8080
- [ ] SonarQube is accessible at http://localhost:9000
- [ ] Grafana is accessible at http://localhost:3000
- [ ] Credentials are configured
- [ ] GitHub webhook is working
- [ ] Pipeline job is created
- [ ] Test build succeeds
- [ ] Reports are generated
- [ ] Alerts are working
- [ ] All services are healthy

---

**For detailed pipeline documentation**, see: `jenkins/README.md`

**For troubleshooting**, check the logs:
```bash
cd /opt/jenkins && docker-compose logs
```
