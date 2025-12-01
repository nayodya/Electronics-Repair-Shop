#!/bin/bash

##############################################
# Electronics Repair Shop - Testing Script
# This script runs all tests and generates reports
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
BACKEND_DIR="${PROJECT_ROOT}/backend"
FRONTEND_DIR="${PROJECT_ROOT}/frontend"
REPORTS_DIR="${PROJECT_ROOT}/reports"

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

# Create reports directory
setup_reports() {
    log_info "Setting up reports directory..."
    mkdir -p "${REPORTS_DIR}"
    log_success "Reports directory created"
}

# Run Backend Unit Tests
run_backend_tests() {
    log_info "Running backend unit tests..."
    
    cd "${BACKEND_DIR}"
    
    # Check if test projects exist
    TEST_PROJECTS=$(find . -name "*Test*.csproj" -o -name "*Tests.csproj" | head -5)
    
    if [ -z "${TEST_PROJECTS}" ]; then
        log_warning "No test projects found"
        return
    fi
    
    # Run tests
    dotnet test \
        -c Release \
        --logger "trx;LogFileName=${REPORTS_DIR}/backend-unit-tests.trx" \
        --collect:"XPlat Code Coverage" \
        --results-directory="${REPORTS_DIR}/coverage" \
        || log_warning "Some backend tests failed"
    
    log_success "Backend unit tests completed"
}

# Run Backend Integration Tests
run_backend_integration_tests() {
    log_info "Running backend integration tests..."
    
    cd "${BACKEND_DIR}"
    
    # Check if integration test projects exist
    INT_TEST_PROJECTS=$(find . -name "*IntegrationTest*.csproj" | head -5)
    
    if [ -z "${INT_TEST_PROJECTS}" ]; then
        log_warning "No integration test projects found"
        return
    fi
    
    # Run tests
    dotnet test \
        -c Release \
        --logger "trx;LogFileName=${REPORTS_DIR}/backend-integration-tests.trx" \
        || log_warning "Some integration tests failed"
    
    log_success "Backend integration tests completed"
}

# Run Frontend Tests
run_frontend_tests() {
    log_info "Running frontend tests..."
    
    cd "${FRONTEND_DIR}"
    
    # Check if test script exists
    if ! grep -q '"test"' package.json; then
        log_warning "No test script found in package.json"
        return
    fi
    
    # Install dependencies
    log_info "Installing frontend dependencies..."
    npm ci
    
    # Run tests
    log_info "Running Jest tests..."
    npm test -- --coverage --coverageDirectory="${REPORTS_DIR}/frontend-coverage" || log_warning "Some frontend tests failed"
    
    log_success "Frontend tests completed"
}

# Run Code Coverage Analysis
run_coverage_analysis() {
    log_info "Analyzing code coverage..."
    
    if [ ! -d "${REPORTS_DIR}/coverage" ]; then
        log_warning "No coverage reports found"
        return
    fi
    
    log_info "Coverage reports:"
    find "${REPORTS_DIR}" -name "*coverage*" -type f
    
    log_success "Coverage analysis completed"
}

# Run Code Quality Checks
run_code_quality() {
    log_info "Running code quality checks..."
    
    # Frontend ESLint
    log_info "Running frontend ESLint..."
    cd "${FRONTEND_DIR}"
    npm run lint || log_warning "ESLint found issues"
    
    # Backend code analysis (if StyleCop is configured)
    log_info "Checking backend code quality..."
    cd "${BACKEND_DIR}"
    dotnet build /p:EnforceCodeStyleInBuild=true || log_warning "Code style issues found"
    
    log_success "Code quality checks completed"
}

# Run Security Tests
run_security_tests() {
    log_info "Running security tests..."
    
    # Frontend dependency vulnerabilities
    log_info "Checking frontend dependencies for vulnerabilities..."
    cd "${FRONTEND_DIR}"
    npm audit || log_warning "Vulnerabilities found in frontend dependencies"
    
    # Backend dependency vulnerabilities
    log_info "Checking backend dependencies for vulnerabilities..."
    cd "${BACKEND_DIR}"
    dotnet list package --vulnerable || log_warning "Vulnerabilities found in backend dependencies"
    
    log_success "Security tests completed"
}

# Run E2E Tests
run_e2e_tests() {
    log_info "Running end-to-end tests..."
    
    # Check if Docker Compose services are running
    log_info "Checking if services are running..."
    
    if ! curl -s http://localhost:5062/health &> /dev/null; then
        log_warning "API is not running. Skipping E2E tests."
        return
    fi
    
    if ! curl -s http://localhost:5173 &> /dev/null; then
        log_warning "Frontend is not running. Skipping E2E tests."
        return
    fi
    
    # Run E2E tests if Playwright is configured
    cd "${FRONTEND_DIR}"
    
    if command -v playwright &> /dev/null; then
        log_info "Running Playwright E2E tests..."
        npx playwright test || log_warning "Some E2E tests failed"
    else
        log_warning "Playwright not installed"
    fi
    
    log_success "E2E tests completed"
}

# Run Performance Tests
run_performance_tests() {
    log_info "Running performance tests..."
    
    # API performance test
    if command -v ab &> /dev/null; then
        log_info "Running Apache Bench load test..."
        ab -n 100 -c 10 -g "${REPORTS_DIR}/api-performance.tsv" \
            http://localhost:5062/health || log_warning "Performance test failed"
    else
        log_warning "Apache Bench not installed"
    fi
    
    # Frontend performance with lighthouse
    if command -v lighthouse &> /dev/null; then
        log_info "Running Lighthouse performance audit..."
        lighthouse http://localhost:5173 \
            --output-path="${REPORTS_DIR}/lighthouse-report.json" \
            --output=json || log_warning "Lighthouse audit failed"
    else
        log_warning "Lighthouse not installed"
    fi
    
    log_success "Performance tests completed"
}

# Generate test report summary
generate_summary() {
    log_info "Generating test summary..."
    
    SUMMARY_FILE="${REPORTS_DIR}/test-summary.txt"
    
    cat > "${SUMMARY_FILE}" << EOF
# Electronics Repair Shop - Test Report Summary
Generated: $(date)

## Test Results
EOF

    # Add test results
    if [ -f "${REPORTS_DIR}/backend-unit-tests.trx" ]; then
        echo "✓ Backend Unit Tests: COMPLETED" >> "${SUMMARY_FILE}"
    fi
    
    if [ -f "${REPORTS_DIR}/backend-integration-tests.trx" ]; then
        echo "✓ Backend Integration Tests: COMPLETED" >> "${SUMMARY_FILE}"
    fi
    
    if [ -d "${REPORTS_DIR}/frontend-coverage" ]; then
        echo "✓ Frontend Tests: COMPLETED" >> "${SUMMARY_FILE}"
    fi
    
    echo "" >> "${SUMMARY_FILE}"
    echo "## Coverage Reports" >> "${SUMMARY_FILE}"
    find "${REPORTS_DIR}" -name "*coverage*" >> "${SUMMARY_FILE}" 2>/dev/null || true
    
    log_success "Test summary generated: ${SUMMARY_FILE}"
    cat "${SUMMARY_FILE}"
}

# Main execution
main() {
    log_info "Starting test suite..."
    
    setup_reports
    
    # Run all tests
    run_code_quality
    run_backend_tests
    run_frontend_tests
    run_security_tests
    run_backend_integration_tests
    run_e2e_tests
    run_performance_tests
    run_coverage_analysis
    
    generate_summary
    
    log_success "Test suite completed!"
    log_info "Reports available at: ${REPORTS_DIR}"
}

# Error handling
trap 'log_error "Script failed at line $LINENO"' ERR

# Run main
main "$@"
