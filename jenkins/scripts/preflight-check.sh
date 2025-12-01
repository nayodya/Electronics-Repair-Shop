#!/bin/bash

##############################################
# Electronics Repair Shop - Pre-flight Check
# Validates pipeline prerequisites
##############################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

CHECKS_PASSED=0
CHECKS_FAILED=0

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[✓]${NC} $1"
    ((CHECKS_PASSED++))
}

log_warning() {
    echo -e "${YELLOW}[⚠]${NC} $1"
}

log_error() {
    echo -e "${RED}[✗]${NC} $1"
    ((CHECKS_FAILED++))
}

log_section() {
    echo ""
    echo -e "${BLUE}════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}════════════════════════════════════════${NC}"
}

# Check Docker
check_docker() {
    log_section "Checking Docker Installation"
    
    if command -v docker &> /dev/null; then
        local version=$(docker --version)
        log_success "$version"
    else
        log_error "Docker not installed"
        return
    fi
    
    # Check if Docker is running
    if docker ps &> /dev/null; then
        log_success "Docker daemon is running"
    else
        log_error "Docker daemon is not running"
    fi
}

# Check Docker Compose
check_docker_compose() {
    log_section "Checking Docker Compose"
    
    if command -v docker-compose &> /dev/null; then
        local version=$(docker-compose --version)
        log_success "$version"
    else
        log_error "Docker Compose not installed"
    fi
}

# Check .NET SDK
check_dotnet() {
    log_section "Checking .NET SDK"
    
    if command -v dotnet &> /dev/null; then
        local version=$(dotnet --version)
        log_success "dotnet $version"
        
        # Check if 8.0 is available
        if dotnet --version | grep -q "8.0"; then
            log_success ".NET 8.0 available"
        else
            log_warning ".NET 8.0 not available (current: $(dotnet --version))"
        fi
    else
        log_error ".NET SDK not installed"
    fi
}

# Check Node.js
check_node() {
    log_section "Checking Node.js"
    
    if command -v node &> /dev/null; then
        local version=$(node --version)
        log_success "Node.js $version"
    else
        log_error "Node.js not installed"
        return
    fi
    
    if command -v npm &> /dev/null; then
        local version=$(npm --version)
        log_success "npm $version"
    else
        log_error "npm not installed"
    fi
}

# Check Git
check_git() {
    log_section "Checking Git"
    
    if command -v git &> /dev/null; then
        local version=$(git --version)
        log_success "$version"
    else
        log_error "Git not installed"
        return
    fi
    
    # Check git config
    if git config --global user.email &> /dev/null; then
        log_success "Git user configured"
    else
        log_warning "Git user not configured (run: git config --global user.email 'your@email.com')"
    fi
}

# Check Kubernetes
check_kubernetes() {
    log_section "Checking Kubernetes"
    
    if command -v kubectl &> /dev/null; then
        local version=$(kubectl version --client --short 2>/dev/null || echo "unknown")
        log_success "kubectl installed"
    else
        log_warning "kubectl not installed (optional)"
    fi
    
    if command -v minikube &> /dev/null; then
        log_success "minikube installed"
    else
        log_warning "minikube not installed (optional)"
    fi
}

# Check Port Availability
check_ports() {
    log_section "Checking Port Availability"
    
    local ports=(8080 5062 5173 9000 3000 9090 5432)
    local occupied=0
    
    for port in "${ports[@]}"; do
        if lsof -i ":$port" &> /dev/null; then
            log_warning "Port $port is in use"
            ((occupied++))
        else
            log_success "Port $port is available"
        fi
    done
    
    if [ $occupied -gt 0 ]; then
        log_warning "$occupied port(s) are in use"
    fi
}

# Check Disk Space
check_disk() {
    log_section "Checking Disk Space"
    
    local available=$(df /opt 2>/dev/null | awk 'NR==2 {print $4}')
    
    if [ -z "$available" ]; then
        available=$(df . | awk 'NR==2 {print $4}')
    fi
    
    local required=$((10 * 1024 * 1024)) # 10GB in KB
    
    if [ "$available" -gt "$required" ]; then
        log_success "Sufficient disk space available ($(numfmt --to=iec $((available * 1024)) 2>/dev/null || echo "$available KB"))"
    else
        log_error "Insufficient disk space ($(numfmt --to=iec $((available * 1024)) 2>/dev/null || echo "$available KB") available, 10GB required)"
    fi
}

# Check Memory
check_memory() {
    log_section "Checking System Memory"
    
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        local total=$(free -b | awk 'NR==2 {print $2}')
        local available=$(free -b | awk 'NR==2 {print $7}')
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        local total=$(sysctl -n hw.memsize)
        local available=$total
    else
        log_warning "Unable to check memory"
        return
    fi
    
    local required=$((4 * 1024 * 1024 * 1024)) # 4GB in bytes
    
    if [ "$available" -gt "$required" ]; then
        log_success "Sufficient memory available ($(numfmt --to=iec $available 2>/dev/null || echo "$available bytes"))"
    else
        log_error "Insufficient memory ($(numfmt --to=iec $available 2>/dev/null || echo "$available bytes") available, 4GB required)"
    fi
}

# Check Project Structure
check_project_structure() {
    log_section "Checking Project Structure"
    
    local required_files=(
        "Jenkinsfile"
        "docker-compose.yml"
        "backend/backend.csproj"
        "frontend/package.json"
        "jenkins/README.md"
    )
    
    local missing=0
    
    for file in "${required_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "$file exists"
        else
            log_error "$file not found"
            ((missing++))
        fi
    done
}

# Check Environment Variables
check_env() {
    log_section "Checking Environment Variables"
    
    if [ -f ".env" ]; then
        log_success ".env file exists"
        
        local required_vars=(
            "GITHUB_USERNAME"
            "GITHUB_TOKEN"
            "DOCKER_USERNAME"
            "DOCKER_PASSWORD"
            "SONARQUBE_TOKEN"
        )
        
        for var in "${required_vars[@]}"; do
            if grep -q "^$var=" .env; then
                log_success "$var configured"
            else
                log_warning "$var not in .env file"
            fi
        done
    else
        log_warning ".env file not found (create one with required variables)"
    fi
}

# Check Jenkins Artifacts
check_jenkins() {
    log_section "Checking Jenkins Artifacts"
    
    local jenkins_files=(
        "jenkins/Jenkinsfile"
        "jenkins/Jenkinsfile.multibranch"
        "jenkins/jenkins-config.yaml"
        "jenkins/docker-compose.yml"
        "jenkins/scripts/build.sh"
        "jenkins/scripts/test.sh"
        "jenkins/scripts/deploy.sh"
        "jenkins/scripts/quality-gate.sh"
        "jenkins/scripts/install-jenkins.sh"
    )
    
    for file in "${jenkins_files[@]}"; do
        if [ -f "$file" ]; then
            log_success "$file exists"
        else
            log_error "$file not found"
        fi
    done
}

# Generate Report
generate_report() {
    log_section "Pre-flight Check Summary"
    
    echo ""
    echo -e "${GREEN}✓ Checks Passed: $CHECKS_PASSED${NC}"
    echo -e "${RED}✗ Checks Failed: $CHECKS_FAILED${NC}"
    
    echo ""
    
    if [ $CHECKS_FAILED -eq 0 ]; then
        echo -e "${GREEN}════════════════════════════════════════${NC}"
        echo -e "${GREEN}All checks passed! Ready for Jenkins setup.${NC}"
        echo -e "${GREEN}════════════════════════════════════════${NC}"
        return 0
    else
        echo -e "${RED}════════════════════════════════════════${NC}"
        echo -e "${RED}Some checks failed. Please fix issues above.${NC}"
        echo -e "${RED}════════════════════════════════════════${NC}"
        return 1
    fi
}

# Main execution
main() {
    echo -e "${BLUE}"
    echo "╔════════════════════════════════════════╗"
    echo "║  Electronics Repair Shop Pre-flight    ║"
    echo "║  Jenkins CI/CD Setup Verification      ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
    
    check_docker
    check_docker_compose
    check_dotnet
    check_node
    check_git
    check_kubernetes
    check_ports
    check_disk
    check_memory
    check_project_structure
    check_env
    check_jenkins
    
    generate_report
}

# Run main
main "$@"
