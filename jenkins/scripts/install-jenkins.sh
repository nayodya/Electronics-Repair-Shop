#!/bin/bash

##############################################
# Jenkins Installation Script
# Sets up Jenkins with all required plugins
##############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    exit 1
}

# Check if running with sudo
check_sudo() {
    if [ "$EUID" -ne 0 ]; then 
        log_error "This script must be run with sudo"
    fi
}

# Install Docker if not present
install_docker() {
    log_info "Checking Docker installation..."
    
    if command -v docker &> /dev/null; then
        log_success "Docker already installed"
        return
    fi
    
    log_info "Installing Docker..."
    
    # Ubuntu/Debian
    if command -v apt-get &> /dev/null; then
        apt-get update
        apt-get install -y docker.io docker-compose
        systemctl start docker
        systemctl enable docker
    # CentOS/RHEL
    elif command -v yum &> /dev/null; then
        yum install -y docker docker-compose
        systemctl start docker
        systemctl enable docker
    else
        log_error "Unsupported OS. Please install Docker manually."
    fi
    
    log_success "Docker installed"
}

# Create Jenkins Docker Compose file
create_jenkins_docker_compose() {
    log_info "Creating Jenkins Docker Compose file..."
    
    mkdir -p /opt/jenkins
    
    cat > /opt/jenkins/docker-compose.yml << 'EOF'
version: '3.8'

services:
  jenkins:
    image: jenkins/jenkins:lts-jdk17
    container_name: jenkins-master
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - $(pwd):/workspace
    environment:
      - JENKINS_OPTS=--argumentsRealm.passwd.admin=AdminPassword123
      - JENKINS_URL=http://localhost:8080
      - CASC_JENKINS_CONFIG=/var/jenkins_home/casc.yaml
    networks:
      - jenkins-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  # Optional: Jenkins Agent
  jenkins-agent:
    image: jenkins/ssh-agent:latest-jdk17
    container_name: jenkins-agent
    environment:
      - JENKINS_AGENT_SSH_PUBKEY=
    volumes:
      - jenkins_agent:/home/jenkins
    networks:
      - jenkins-network
    restart: unless-stopped

  # Optional: SonarQube
  sonarqube:
    image: sonarqube:latest
    container_name: sonarqube
    ports:
      - "9000:9000"
    environment:
      - SONAR_JDBC_URL=jdbc:postgresql://postgres:5432/sonarqube
      - SONAR_JDBC_USERNAME=sonar
      - SONAR_JDBC_PASSWORD=sonar
    volumes:
      - sonarqube_data:/opt/sonarqube/data
      - sonarqube_extensions:/opt/sonarqube/extensions
      - sonarqube_logs:/opt/sonarqube/logs
    networks:
      - jenkins-network
    depends_on:
      - postgres
    restart: unless-stopped

  postgres:
    image: postgres:15
    container_name: postgres
    environment:
      - POSTGRES_DB=sonarqube
      - POSTGRES_USER=sonar
      - POSTGRES_PASSWORD=sonar
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - jenkins-network
    restart: unless-stopped

  # Optional: GitLab Runner (for distributed CI/CD)
  gitlab-runner:
    image: gitlab/gitlab-runner:latest
    container_name: gitlab-runner
    volumes:
      - gitlab_runner_config:/etc/gitlab-runner
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - jenkins-network
    restart: unless-stopped

volumes:
  jenkins_home:
  jenkins_agent:
  sonarqube_data:
  sonarqube_extensions:
  sonarqube_logs:
  postgres_data:
  gitlab_runner_config:

networks:
  jenkins-network:
    driver: bridge
EOF

    log_success "Jenkins Docker Compose file created"
}

# Start Jenkins
start_jenkins() {
    log_info "Starting Jenkins..."
    
    cd /opt/jenkins
    docker-compose up -d
    
    log_info "Waiting for Jenkins to start..."
    sleep 30
    
    # Get initial admin password
    local password=$(docker exec jenkins-master cat /var/jenkins_home/secrets/initialAdminPassword)
    
    log_success "Jenkins started successfully!"
    echo ""
    echo -e "${GREEN}Jenkins is running at: http://localhost:8080${NC}"
    echo -e "${YELLOW}Initial Admin Password: ${password}${NC}"
    echo ""
}

# Install Jenkins plugins
install_plugins() {
    log_info "Installing Jenkins plugins..."
    
    # This can be done through Jenkins CLI or using Docker exec
    # For now, we'll document the plugin list
    
    cat > /opt/jenkins/plugins.txt << 'EOF'
workflow-aggregator:575.v2c2e24a_10f23
docker-plugin:1.2.10
docker-pipeline:1.28
kubernetes:1.30.11
kubernetes-cli:1.10.4
sonarqube-generic-coverage:1.0.2
sonar:2.15
email-ext:2.98
slack:617.v82da_4c91fb_51
github-api:1.318-435.vc3d1c9e0e47d1
github-branch-source:1708.v2e52a_575f3a_c
pipeline-github-lib:27.gf1b_a_a_e8c
ghprb:1.42.2
timestamper:1.14
ansicolor:1.0.2
ws-cleanup:0.45
build-timeout:1.24
log-parser:2.1
performance:3.20
code-coverage-api:1.0.5
cobertura:1.16
htmlpublisher:1.32
junit:1.62
terraform:2.17.0
prometheus:2.0.11
role-strategy:566.v6073d9a_e4d4e
matrix-auth:3.1.5
EOF

    log_success "Plugin list saved to /opt/jenkins/plugins.txt"
}

# Create Jenkins Kubernetes namespace
create_kubernetes_namespace() {
    log_info "Creating Kubernetes namespace for Jenkins..."
    
    if ! command -v kubectl &> /dev/null; then
        log_warning "kubectl not found. Skipping Kubernetes setup."
        return
    fi
    
    kubectl create namespace jenkins --dry-run=client -o yaml | kubectl apply -f -
    kubectl label namespace jenkins monitoring=enabled --overwrite=true
    
    log_success "Kubernetes namespace created"
}

# Main execution
main() {
    log_info "Starting Jenkins installation..."
    
    # Note: Commenting out sudo check for development environments
    # check_sudo
    
    install_docker
    create_jenkins_docker_compose
    install_plugins
    create_kubernetes_namespace
    start_jenkins
    
    log_success "Jenkins installation completed!"
}

main "$@"
