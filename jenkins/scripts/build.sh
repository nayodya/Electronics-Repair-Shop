#!/bin/bash

##############################################
# Electronics Repair Shop - Build Script
# This script handles building all components
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
BUILD_DIR="${PROJECT_ROOT}/build"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-docker.io}"
BUILD_NUMBER="${BUILD_NUMBER:-latest}"

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

# Create build directory
create_build_dirs() {
    log_info "Creating build directories..."
    mkdir -p "${BUILD_DIR}"/{backend,frontend,reports}
    log_success "Build directories created"
}

# Build Backend
build_backend() {
    log_info "Building backend..."
    
    cd "${BACKEND_DIR}"
    
    # Restore NuGet packages
    log_info "Restoring NuGet packages..."
    dotnet restore
    
    # Build Release configuration
    log_info "Building release configuration..."
    dotnet build -c Release -o "${BUILD_DIR}/backend"
    
    # Run tests if test project exists
    if [ -f "${BACKEND_DIR}/Tests" ]; then
        log_info "Running backend tests..."
        dotnet test -c Release --logger "trx;LogFileName=${BUILD_DIR}/reports/backend-tests.trx" || log_warning "Some tests failed"
    fi
    
    log_success "Backend built successfully"
}

# Build Frontend
build_frontend() {
    log_info "Building frontend..."
    
    cd "${FRONTEND_DIR}"
    
    # Install dependencies
    log_info "Installing npm dependencies..."
    npm ci
    
    # Run linting
    log_info "Running ESLint..."
    npm run lint || log_warning "Linting issues found"
    
    # Build
    log_info "Building frontend..."
    npm run build
    
    # Copy dist to build directory
    if [ -d "dist" ]; then
        cp -r dist "${BUILD_DIR}/frontend/"
    fi
    
    log_success "Frontend built successfully"
}

# Build Docker Images
build_docker_images() {
    log_info "Building Docker images..."
    
    # Backend image
    log_info "Building backend Docker image..."
    docker build \
        -f "${BACKEND_DIR}/Dockerfile" \
        -t "electronics-repair-backend:${BUILD_NUMBER}" \
        -t "electronics-repair-backend:latest" \
        "${BACKEND_DIR}"
    
    # Frontend image
    log_info "Building frontend Docker image..."
    docker build \
        -f "${FRONTEND_DIR}/Dockerfile" \
        -t "electronics-repair-frontend:${BUILD_NUMBER}" \
        -t "electronics-repair-frontend:latest" \
        "${FRONTEND_DIR}"
    
    log_success "Docker images built successfully"
}

# Scan Docker images
scan_docker_images() {
    log_info "Scanning Docker images for vulnerabilities..."
    
    if ! command -v trivy &> /dev/null; then
        log_warning "Trivy not found. Skipping image scanning."
        return
    fi
    
    log_info "Scanning backend image..."
    trivy image --severity HIGH,CRITICAL \
        "electronics-repair-backend:${BUILD_NUMBER}" || log_warning "Backend image has vulnerabilities"
    
    log_info "Scanning frontend image..."
    trivy image --severity HIGH,CRITICAL \
        "electronics-repair-frontend:${BUILD_NUMBER}" || log_warning "Frontend image has vulnerabilities"
    
    log_success "Image scanning completed"
}

# Push to registry
push_to_registry() {
    log_info "Pushing images to registry..."
    
    if [ -z "${DOCKER_USERNAME}" ] || [ -z "${DOCKER_PASSWORD}" ]; then
        log_warning "Docker credentials not set. Skipping push."
        return
    fi
    
    # Login
    echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin "${DOCKER_REGISTRY}"
    
    # Tag images
    docker tag "electronics-repair-backend:${BUILD_NUMBER}" \
        "${DOCKER_REGISTRY}/electronics-repair-backend:${BUILD_NUMBER}"
    docker tag "electronics-repair-frontend:${BUILD_NUMBER}" \
        "${DOCKER_REGISTRY}/electronics-repair-frontend:${BUILD_NUMBER}"
    
    # Push
    docker push "${DOCKER_REGISTRY}/electronics-repair-backend:${BUILD_NUMBER}"
    docker push "${DOCKER_REGISTRY}/electronics-repair-frontend:${BUILD_NUMBER}"
    
    # Logout
    docker logout "${DOCKER_REGISTRY}"
    
    log_success "Images pushed to registry successfully"
}

# Cleanup
cleanup() {
    log_info "Cleaning up..."
    docker logout "${DOCKER_REGISTRY}" 2>/dev/null || true
}

# Main execution
main() {
    log_info "Starting build process..."
    
    trap cleanup EXIT
    
    create_build_dirs
    build_backend
    build_frontend
    build_docker_images
    scan_docker_images
    push_to_registry
    
    log_success "Build process completed successfully!"
}

# Run main
main "$@"
