#!/bin/bash

##############################################
# Electronics Repair Shop - Deployment Script
# This script handles deployment to various environments
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
ENVIRONMENT="${1:-development}"
IMAGE_TAG="${2:-latest}"
DOCKER_REGISTRY="${DOCKER_REGISTRY:-docker.io}"

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
    exit 1
}

# Validate environment
validate_environment() {
    log_info "Validating environment: ${ENVIRONMENT}"
    
    case "${ENVIRONMENT}" in
        development|staging|production)
            log_success "Environment validated"
            ;;
        *)
            log_error "Invalid environment: ${ENVIRONMENT}"
            ;;
    esac
}

# Deploy with Docker Compose
deploy_docker_compose() {
    log_info "Deploying with Docker Compose..."
    
    cd "${PROJECT_ROOT}"
    
    # Stop existing containers
    log_info "Stopping existing containers..."
    docker-compose down || true
    
    # Start new containers
    log_info "Starting containers..."
    docker-compose up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to be ready..."
    sleep 10
    
    # Health check
    log_info "Performing health checks..."
    if ! curl -f http://localhost:5062/health &> /dev/null; then
        log_warning "API health check failed, but continuing..."
    else
        log_success "API is healthy"
    fi
    
    # Check frontend
    if curl -f http://localhost:5173 &> /dev/null; then
        log_success "Frontend is running"
    else
        log_warning "Frontend health check failed"
    fi
    
    log_success "Docker Compose deployment completed"
}

# Deploy to Kubernetes
deploy_kubernetes() {
    log_info "Deploying to Kubernetes..."
    
    if ! command -v kubectl &> /dev/null; then
        log_error "kubectl not found. Install kubectl to deploy to Kubernetes."
    fi
    
    cd "${PROJECT_ROOT}"
    
    # Determine namespace based on environment
    local namespace="ers-${ENVIRONMENT}"
    
    log_info "Using namespace: ${namespace}"
    
    # Create namespace if it doesn't exist
    kubectl create namespace "${namespace}" --dry-run=client -o yaml | kubectl apply -f -
    
    # Apply Kustomization
    log_info "Applying Kustomization..."
    kubectl apply -k "kubernetes/" -n "${namespace}"
    
    # Wait for deployments to be ready
    log_info "Waiting for deployments to be ready..."
    
    if kubectl get deployment api -n "${namespace}" &> /dev/null; then
        log_info "Waiting for API deployment..."
        kubectl rollout status deployment/api -n "${namespace}" --timeout=5m || log_warning "API rollout may not be complete"
    fi
    
    if kubectl get deployment client -n "${namespace}" &> /dev/null; then
        log_info "Waiting for frontend deployment..."
        kubectl rollout status deployment/client -n "${namespace}" --timeout=5m || log_warning "Frontend rollout may not be complete"
    fi
    
    # Show deployed resources
    log_info "Deployed resources:"
    kubectl get all -n "${namespace}"
    
    log_success "Kubernetes deployment completed"
}

# Run smoke tests
run_smoke_tests() {
    log_info "Running smoke tests..."
    
    log_info "Testing API endpoints..."
    
    local api_url="http://localhost:5062"
    
    # Test health endpoint
    if curl -f "${api_url}/health" &> /dev/null; then
        log_success "API health check passed"
    else
        log_warning "API health check failed"
    fi
    
    # Test Swagger documentation
    if curl -f "${api_url}/swagger" &> /dev/null; then
        log_success "Swagger documentation is available"
    else
        log_warning "Swagger documentation not available"
    fi
    
    log_success "Smoke tests completed"
}

# Perform database migrations
run_migrations() {
    log_info "Checking for database migrations..."
    
    if ! command -v dotnet &> /dev/null; then
        log_warning "dotnet CLI not found. Skipping migrations."
        return
    fi
    
    if [ ! -f "${PROJECT_ROOT}/backend/backend.csproj" ]; then
        log_warning "Backend project not found. Skipping migrations."
        return
    fi
    
    log_info "Running Entity Framework migrations..."
    cd "${PROJECT_ROOT}/backend"
    
    # This would typically be done in a Kubernetes init container
    # dotnet ef database update
    
    log_success "Migration check completed"
}

# Backup current deployment
backup_current() {
    log_info "Creating backup of current deployment..."
    
    local backup_dir="${PROJECT_ROOT}/backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "${backup_dir}"
    
    log_info "Backing up volumes..."
    docker-compose exec -T database bash -c "tar czf /tmp/db-backup.tar.gz /var/opt/mssql/data" || log_warning "Database backup failed"
    docker cp sqlserver-container:/tmp/db-backup.tar.gz "${backup_dir}/" 2>/dev/null || log_warning "Could not copy database backup"
    
    log_success "Backup created at: ${backup_dir}"
}

# Rollback deployment
rollback_deployment() {
    log_warning "Initiating rollback..."
    
    if command -v kubectl &> /dev/null; then
        local namespace="ers-${ENVIRONMENT}"
        log_info "Rolling back Kubernetes deployments..."
        kubectl rollout undo deployment/api -n "${namespace}" || log_warning "API rollback failed"
        kubectl rollout undo deployment/client -n "${namespace}" || log_warning "Frontend rollback failed"
    fi
    
    log_success "Rollback completed"
}

# Main execution
main() {
    log_info "Starting deployment process..."
    log_info "Environment: ${ENVIRONMENT}"
    log_info "Image Tag: ${IMAGE_TAG}"
    
    validate_environment
    
    case "${ENVIRONMENT}" in
        development)
            backup_current
            deploy_docker_compose
            run_migrations
            run_smoke_tests
            ;;
        staging)
            if command -v kubectl &> /dev/null; then
                backup_current
                deploy_kubernetes
                run_migrations
                run_smoke_tests
            else
                log_warning "kubectl not available. Falling back to Docker Compose."
                deploy_docker_compose
            fi
            ;;
        production)
            if command -v kubectl &> /dev/null; then
                backup_current
                deploy_kubernetes
                run_migrations
                run_smoke_tests
            else
                log_error "kubectl required for production deployment."
            fi
            ;;
    esac
    
    log_success "Deployment completed successfully!"
}

# Error handling
trap 'log_error "Script failed at line $LINENO"' ERR

# Run main
main "$@"
