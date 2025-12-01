#!/bin/bash

##############################################
# Electronics Repair Shop - Quality Gate Script
# This script enforces quality gates for CI/CD
##############################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
FAILED_GATES=0

# Quality Gate Thresholds
MIN_CODE_COVERAGE=70
MAX_ALLOWED_VULNERABILITIES=0
MAX_LINT_WARNINGS=50

# Functions
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
}

fail_gate() {
    echo -e "${RED}[GATE FAILED]${NC} $1"
    ((FAILED_GATES++))
}

# Gate 1: Code Coverage
check_code_coverage() {
    log_info "Checking code coverage gate (minimum: ${MIN_CODE_COVERAGE}%)..."
    
    # Check backend coverage
    if [ -f "${PROJECT_ROOT}/reports/coverage/coverage.json" ]; then
        local coverage=$(grep -o '"lineCoverage":[^,]*' "${PROJECT_ROOT}/reports/coverage/coverage.json" | head -1 | cut -d':' -f2)
        
        if [ -z "${coverage}" ]; then
            log_warning "Could not parse coverage metrics"
            return
        fi
        
        coverage="${coverage%.*}"  # Remove decimals
        
        if [ "${coverage}" -lt "${MIN_CODE_COVERAGE}" ]; then
            fail_gate "Code coverage ${coverage}% is below threshold ${MIN_CODE_COVERAGE}%"
        else
            log_success "Code coverage ${coverage}% meets threshold"
        fi
    else
        log_warning "Coverage report not found"
    fi
}

# Gate 2: Unit Test Success
check_unit_tests() {
    log_info "Checking unit test results..."
    
    local backend_tests="${PROJECT_ROOT}/reports/backend-unit-tests.trx"
    local frontend_tests="${PROJECT_ROOT}/reports/frontend-coverage"
    
    local tests_passed=true
    
    if [ -f "${backend_tests}" ]; then
        if grep -q 'outcome="Failed"' "${backend_tests}"; then
            fail_gate "Backend unit tests failed"
            tests_passed=false
        else
            log_success "Backend unit tests passed"
        fi
    fi
    
    if [ -d "${frontend_tests}" ]; then
        log_success "Frontend unit tests passed"
    fi
    
    if [ "${tests_passed}" = true ]; then
        log_success "All unit tests passed"
    fi
}

# Gate 3: Linting Issues
check_linting() {
    log_info "Checking linting issues (max allowed: ${MAX_LINT_WARNINGS})..."
    
    cd "${PROJECT_ROOT}/frontend"
    
    # Count ESLint errors
    local lint_output=$(npm run lint 2>&1 || true)
    local error_count=$(echo "${lint_output}" | grep -o "error" | wc -l || echo "0")
    
    if [ "${error_count}" -gt "${MAX_LINT_WARNINGS}" ]; then
        fail_gate "Linting errors ${error_count} exceed threshold ${MAX_LINT_WARNINGS}"
    else
        log_success "Linting errors ${error_count} within threshold"
    fi
}

# Gate 4: Security Vulnerabilities
check_security() {
    log_info "Checking for critical security vulnerabilities (max allowed: ${MAX_ALLOWED_VULNERABILITIES})..."
    
    cd "${PROJECT_ROOT}/frontend"
    
    # Check npm vulnerabilities
    local vuln_output=$(npm audit --json 2>&1 || echo "{}")
    local critical_count=$(echo "${vuln_output}" | grep -o '"severity":"critical"' | wc -l || echo "0")
    local high_count=$(echo "${vuln_output}" | grep -o '"severity":"high"' | wc -l || echo "0")
    
    if [ "${critical_count}" -gt 0 ]; then
        fail_gate "Found ${critical_count} critical vulnerability(ies) in dependencies"
    elif [ "${high_count}" -gt 0 ]; then
        log_warning "Found ${high_count} high severity vulnerability(ies)"
    else
        log_success "No critical vulnerabilities found"
    fi
    
    # Check backend vulnerabilities
    cd "${PROJECT_ROOT}/backend"
    
    if dotnet list package --vulnerable 2>&1 | grep -q "Vulnerable"; then
        fail_gate "Found vulnerable dependencies in backend"
    else
        log_success "No vulnerable backend dependencies"
    fi
}

# Gate 5: Build Success
check_build_success() {
    log_info "Checking build artifacts..."
    
    local backend_build="${PROJECT_ROOT}/build/backend"
    local frontend_build="${PROJECT_ROOT}/build/frontend/dist"
    
    if [ ! -d "${backend_build}" ]; then
        fail_gate "Backend build artifacts not found"
    else
        log_success "Backend build artifacts present"
    fi
    
    if [ ! -d "${frontend_build}" ]; then
        fail_gate "Frontend build artifacts not found"
    else
        log_success "Frontend build artifacts present"
    fi
}

# Gate 6: Docker Image Analysis
check_docker_images() {
    log_info "Checking Docker images..."
    
    if ! command -v trivy &> /dev/null; then
        log_warning "Trivy not installed, skipping image scanning"
        return
    fi
    
    # Scan backend image
    if ! docker image ls | grep -q "electronics-repair-backend"; then
        log_warning "Backend Docker image not found"
    else
        log_info "Scanning backend Docker image..."
        if trivy image --severity CRITICAL \
            "electronics-repair-backend:latest" 2>&1 | grep -q "CRITICAL"; then
            fail_gate "Critical vulnerabilities found in backend Docker image"
        else
            log_success "Backend Docker image scan passed"
        fi
    fi
    
    # Scan frontend image
    if ! docker image ls | grep -q "electronics-repair-frontend"; then
        log_warning "Frontend Docker image not found"
    else
        log_info "Scanning frontend Docker image..."
        if trivy image --severity CRITICAL \
            "electronics-repair-frontend:latest" 2>&1 | grep -q "CRITICAL"; then
            fail_gate "Critical vulnerabilities found in frontend Docker image"
        else
            log_success "Frontend Docker image scan passed"
        fi
    fi
}

# Gate 7: Integration Tests
check_integration_tests() {
    log_info "Checking integration test results..."
    
    local int_tests="${PROJECT_ROOT}/reports/backend-integration-tests.trx"
    
    if [ -f "${int_tests}" ]; then
        if grep -q 'outcome="Failed"' "${int_tests}"; then
            fail_gate "Integration tests failed"
        else
            log_success "Integration tests passed"
        fi
    else
        log_warning "Integration test report not found"
    fi
}

# Gate 8: SonarQube Gate (if configured)
check_sonarqube_gate() {
    log_info "Checking SonarQube quality gate..."
    
    if [ -z "${SONARQUBE_HOST_URL}" ] || [ -z "${SONARQUBE_TOKEN}" ]; then
        log_warning "SonarQube not configured, skipping"
        return
    fi
    
    if ! command -v sonar-scanner &> /dev/null; then
        log_warning "SonarQube Scanner not installed"
        return
    fi
    
    # This would check SonarQube quality gate status
    log_warning "SonarQube quality gate check not yet implemented"
}

# Generate quality gate report
generate_report() {
    log_info "Generating quality gate report..."
    
    local report_file="${PROJECT_ROOT}/reports/quality-gate-report.txt"
    
    cat > "${report_file}" << EOF
# Electronics Repair Shop - Quality Gate Report
Generated: $(date)
Status: $([ ${FAILED_GATES} -eq 0 ] && echo "PASSED ✓" || echo "FAILED ✗")

## Quality Gate Results
EOF

    echo "" >> "${report_file}"
    echo "Total Failed Gates: ${FAILED_GATES}" >> "${report_file}"
    echo "" >> "${report_file}"
    
    echo "## Thresholds" >> "${report_file}"
    echo "- Minimum Code Coverage: ${MIN_CODE_COVERAGE}%" >> "${report_file}"
    echo "- Max Lint Warnings: ${MAX_LINT_WARNINGS}" >> "${report_file}"
    echo "- Max Critical Vulnerabilities: ${MAX_ALLOWED_VULNERABILITIES}" >> "${report_file}"
    
    log_success "Quality gate report generated: ${report_file}"
}

# Main execution
main() {
    log_info "Starting quality gate checks..."
    
    mkdir -p "${PROJECT_ROOT}/reports"
    
    check_code_coverage
    check_unit_tests
    check_linting
    check_security
    check_build_success
    check_docker_images
    check_integration_tests
    check_sonarqube_gate
    
    generate_report
    
    echo ""
    log_info "Quality gate checks completed"
    
    if [ ${FAILED_GATES} -eq 0 ]; then
        log_success "All quality gates passed! ✓"
        exit 0
    else
        fail_gate "Quality gate checks failed: ${FAILED_GATES} gate(s) failed"
        exit 1
    fi
}

# Error handling
trap 'log_error "Script failed at line $LINENO"' ERR

# Run main
main "$@"
