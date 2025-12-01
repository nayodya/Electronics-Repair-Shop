# Jenkins CI/CD Pipeline Documentation for Electronics Repair Shop

## Overview

This directory contains comprehensive Jenkins CI/CD pipeline configuration for the Electronics Repair Shop project. The pipeline automates building, testing, security scanning, and deployment of the full-stack application.

## 📁 Directory Structure

```
jenkins/
├── Jenkinsfile                 # Main pipeline definition
├── Jenkinsfile.multibranch    # Multi-branch pipeline for different branches
├── jenkins-config.yaml        # Jenkins configuration as code
├── docker-compose.yml         # Jenkins services stack
├── scripts/
│   ├── install-jenkins.sh    # Jenkins installation script
│   ├── build.sh              # Build script for backend and frontend
│   ├── test.sh               # Comprehensive test suite
│   ├── deploy.sh             # Deployment orchestration
│   └── quality-gate.sh       # Quality gate enforcement
├── grafana/
│   └── provisioning/         # Grafana dashboards and data sources
└── README.md                 # This file
```

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Git
- Bash shell
- At least 4GB RAM
- 10GB disk space

### Installation

1. **Install Jenkins with Docker**

```bash
cd jenkins/scripts
bash install-jenkins.sh
```

This will:
- Install Docker if not present
- Create Jenkins service stack
- Start Jenkins container
- Display initial admin password

2. **Access Jenkins**

Open your browser and navigate to:
```
http://localhost:8080
```

Use the initial admin password provided by the installation script.

3. **Configure Jenkins**

During first run, Jenkins will prompt you to:
- Install recommended plugins
- Create admin user
- Configure system settings

## 🔄 Pipeline Stages

### Main Pipeline (Jenkinsfile)

The main pipeline executes the following stages:

#### 1. **Checkout**
- Clones repository from version control
- Prepares workspace

#### 2. **Environment Check**
- Verifies tool availability (Docker, Docker Compose, .NET, Node.js)
- Logs environment information

#### 3. **Build Backend**
- Restores NuGet packages
- Builds .NET 8.0 application
- Runs unit tests (if available)

#### 4. **Build Frontend**
- Installs npm dependencies
- Runs ESLint checks
- Builds React application with Vite

#### 5. **SonarQube Analysis** (Main branch only)
- Performs static code analysis
- Checks code quality metrics
- Identifies code smells and bugs

#### 6. **Build Docker Images**
- Builds backend Docker image
- Builds frontend Docker image
- Tags images for registry

#### 7. **Security Scanning**
- Scans images with Trivy
- Checks for secrets in code
- Analyzes dependencies

#### 8. **Push to Registry** (Main branch only)
- Authenticates with Docker registry
- Pushes images to registry
- Tags images appropriately

#### 9. **Deploy** (Main branch only)
- Deploys to development/staging/production
- Performs health checks
- Validates deployment

#### 10. **Integration Tests**
- Runs API smoke tests
- Validates frontend functionality

#### 11. **Performance Testing** (Main branch only)
- Runs Apache Bench load tests
- Performs Lighthouse audits

#### 12. **Generate Reports**
- Collects test results
- Generates coverage reports
- Creates audit logs

### Multi-branch Pipeline (Jenkinsfile.multibranch)

Enhanced pipeline with:
- Parallel execution stages
- Advanced security scanning
- SAST analysis with Semgrep
- Secret detection
- Performance metrics

## 🔐 Security Features

### Integrated Security Scanning

1. **Container Scanning (Trivy)**
   - Scans Docker images for vulnerabilities
   - Identifies critical and high-severity issues

2. **Dependency Checking**
   - npm audit for frontend dependencies
   - dotnet list package --vulnerable for backend

3. **SAST Analysis (Semgrep)**
   - Source code security analysis
   - Detects common vulnerabilities

4. **Secret Detection**
   - Identifies exposed credentials
   - Prevents secrets in code

5. **Quality Gates**
   - Enforces code coverage thresholds
   - Prevents deployment of low-quality builds

## 📊 Quality Gates

Quality gates are configured to enforce:

- **Code Coverage**: Minimum 70%
- **Unit Tests**: 100% pass rate
- **Linting**: Maximum 50 warnings
- **Critical Vulnerabilities**: 0 allowed
- **Build Success**: Required
- **Integration Tests**: Must pass

Access quality gate enforcement:
```bash
bash jenkins/scripts/quality-gate.sh
```

## 📦 Build Scripts

### Build Script (build.sh)

Handles complete build process:

```bash
bash jenkins/scripts/build.sh
```

**Tasks:**
- Creates build directories
- Builds backend and frontend
- Builds Docker images
- Scans images for vulnerabilities
- Pushes to registry (with credentials)

**Environment Variables:**
- `DOCKER_REGISTRY`: Docker registry URL (default: docker.io)
- `BUILD_NUMBER`: Build number for tagging
- `DOCKER_USERNAME`: Registry username
- `DOCKER_PASSWORD`: Registry password

### Test Script (test.sh)

Comprehensive testing suite:

```bash
bash jenkins/scripts/test.sh
```

**Tests Performed:**
- Backend unit tests
- Backend integration tests
- Frontend unit tests
- Code coverage analysis
- Code quality checks
- Security vulnerability scanning
- E2E tests
- Performance testing

**Output:**
- Test result reports (TRX format)
- Coverage reports (HTML)
- Performance metrics

### Deploy Script (deploy.sh)

Orchestrates deployment:

```bash
bash jenkins/scripts/deploy.sh [environment] [image_tag]
```

**Environments:**
- `development` - Uses Docker Compose
- `staging` - Uses Kubernetes
- `production` - Uses Kubernetes with backups

**Features:**
- Database migrations
- Health checks
- Smoke tests
- Automatic rollback on failure
- Backup creation

### Quality Gate Script (quality-gate.sh)

Enforces quality standards:

```bash
bash jenkins/scripts/quality-gate.sh
```

**Gates Checked:**
1. Code coverage threshold
2. Unit test success
3. Linting issues
4. Security vulnerabilities
5. Build artifacts presence
6. Docker image analysis
7. Integration tests
8. SonarQube quality gate

## 🔑 Jenkins Credentials

Required credentials in Jenkins:

1. **GitHub Credentials**
   - ID: `github-credentials`
   - Type: Username/Password
   - Use: Repository access

2. **Docker Registry**
   - ID: `docker-registry-credentials`
   - Type: Username/Password
   - Use: Image push/pull

3. **SonarQube Token**
   - ID: `sonarqube-token`
   - Type: Secret text
   - Use: Code quality analysis

4. **Slack Webhook**
   - ID: `slack-webhook-url`
   - Type: Secret text
   - Use: Build notifications

5. **Email Credentials**
   - ID: `email-credentials`
   - Type: Username/Password
   - Use: Email notifications

### Adding Credentials

1. Go to **Manage Jenkins** → **Manage Credentials**
2. Click **Add Credentials** in global domain
3. Fill in credential details
4. Save

Or use Jenkins CLI:
```bash
java -jar jenkins-cli.jar -s http://localhost:8080 \
  create-credentials-by-xml system::system default \
  < credential-file.xml
```

## 🔗 Webhook Configuration

### GitHub Webhook

1. Go to GitHub repository settings
2. Navigate to **Webhooks**
3. Add webhook with:
   - **Payload URL**: `http://your-jenkins-url/github-webhook/`
   - **Content type**: `application/json`
   - **Events**: Push, Pull Request

### GitLab Webhook (if using GitLab)

1. Go to project settings
2. Navigate to **Integrations**
3. Add webhook with:
   - **URL**: `http://your-jenkins-url/gitlab-webhook/`
   - **Events**: Push events, Merge request events

## 📈 Monitoring and Reporting

### Jenkins Dashboard

Access at: `http://localhost:8080`

**Key Sections:**
- Build history
- Test results
- Code coverage trends
- Security scan results

### SonarQube Dashboard

Access at: `http://localhost:9000`

**Metrics:**
- Code coverage
- Code quality rating
- Security issues
- Technical debt

### Grafana Dashboards

Access at: `http://localhost:3000`

Pre-configured dashboards:
- Jenkins pipeline metrics
- Build success rates
- Performance trends
- Deployment frequency

## 🐛 Troubleshooting

### Jenkins Won't Start

```bash
# Check logs
docker-compose logs -f jenkins

# Restart service
docker-compose restart jenkins

# Check port availability
lsof -i :8080
```

### Build Failures

1. **Check logs**: Jenkins UI → Build → Console Output
2. **Verify environment**: `docker-compose exec jenkins jenkins-cli system-info`
3. **Check credentials**: Manage Jenkins → Manage Credentials

### Plugin Issues

```bash
# Reinstall plugins
docker-compose exec jenkins bash
# Inside container
java -jar jenkins.war --install-plugin docker-plugin=1.2.10

# Restart
docker-compose restart jenkins
```

### Docker Permission Denied

```bash
# Add jenkins user to docker group
docker-compose exec jenkins usermod -aG docker jenkins
docker-compose restart jenkins
```

## 📝 Pipeline Configuration as Code

Jenkins uses YAML configuration:

**File:** `jenkins/jenkins-config.yaml`

**Manages:**
- System settings
- Plugin configuration
- Credentials
- Security settings
- Global libraries

## 🔄 CI/CD Best Practices

1. **Branch Strategy**
   - `main` - Production releases
   - `develop` - Development builds
   - `feature/*` - Feature branches

2. **Commit Messages**
   - Use conventional commits
   - Reference issue numbers

3. **Testing**
   - Write tests for all changes
   - Maintain high coverage
   - Run tests locally before push

4. **Code Review**
   - Require pull request reviews
   - Address CI failures before merge

5. **Deployment**
   - Use environment-specific configs
   - Always test in staging first
   - Create backups before production

## 📚 Additional Resources

- [Jenkins Documentation](https://www.jenkins.io/doc/)
- [Docker Documentation](https://docs.docker.com/)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)

## 🤝 Contributing

To improve the Jenkins pipeline:

1. Update relevant script files
2. Test changes in development environment
3. Create pull request with documentation
4. Get approval before merging

## 📞 Support

For issues or questions:

- Create issue in GitHub
- Check troubleshooting section
- Review pipeline logs
- Contact DevOps team

---

**Last Updated**: November 2025
**Version**: 1.0
**Maintainer**: DevOps Team

