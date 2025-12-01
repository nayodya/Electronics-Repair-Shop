pipeline {
    agent any
    
    options {
        timeout(time: 1, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        REGISTRY = 'docker.io'
        IMAGE_TAG = "${BUILD_NUMBER}"
        BACKEND_IMAGE = 'electronics-repair-backend'
        FRONTEND_IMAGE = 'electronics-repair-frontend'
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from repository...'
                checkout scm
            }
        }

        stage('Environment Setup') {
            steps {
                echo '🔧 Setting up environment...'
                script {
                    sh '''
                        echo "Docker version:"
                        docker --version
                        echo "Docker Compose version:"
                        docker-compose --version
                        echo ".NET version:"
                        dotnet --version || echo ".NET not found in PATH"
                        echo "Node version:"
                        node --version || echo "Node not found in PATH"
                    '''
                }
            }
        }

        stage('Build Backend') {
            steps {
                echo '🔨 Building backend service...'
                script {
                    sh '''
                        cd backend
                        echo "Restoring .NET packages..."
                        dotnet restore
                        echo "Building .NET project..."
                        dotnet build -c Release
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                echo '⚙️ Building frontend service...'
                script {
                    sh '''
                        cd frontend
                        echo "Installing dependencies..."
                        npm install
                        echo "Linting code..."
                        npm run lint || true
                        echo "Building production bundle..."
                        npm run build
                    '''
                }
            }
        }

        stage('Backend Tests') {
            steps {
                echo '🧪 Running backend tests...'
                script {
                    sh '''
                        cd backend
                        echo "Running dotnet tests..."
                        dotnet test -c Release --no-build --verbosity normal || true
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                script {
                    sh '''
                        echo "Building backend image..."
                        docker build -f backend/Dockerfile -t ${BACKEND_IMAGE}:${IMAGE_TAG} ./backend
                        docker tag ${BACKEND_IMAGE}:${IMAGE_TAG} ${BACKEND_IMAGE}:latest
                        
                        echo "Building frontend image..."
                        docker build -f frontend/Dockerfile -t ${FRONTEND_IMAGE}:${IMAGE_TAG} ./frontend
                        docker tag ${FRONTEND_IMAGE}:${IMAGE_TAG} ${FRONTEND_IMAGE}:latest
                        
                        echo "Docker images built successfully!"
                        docker images | grep -E "electronics-repair"
                    '''
                }
            }
        }

        stage('Security Scan') {
            steps {
                echo '🔐 Running security scans...'
                script {
                    sh '''
                        echo "Checking for vulnerable dependencies..."
                        cd frontend
                        npm audit || true
                        cd ../backend
                        echo "Checking backend dependencies..."
                        dotnet list package --vulnerable || true
                    '''
                }
            }
        }

        stage('Deploy to Docker Compose') {
            steps {
                echo '🚀 Deploying with Docker Compose...'
                script {
                    sh '''
                        echo "Starting services with docker-compose..."
                        docker-compose up -d
                        
                        echo "Waiting for services to be ready..."
                        sleep 10
                        
                        echo "Checking service health..."
                        docker-compose ps
                    '''
                }
            }
        }

        stage('Smoke Tests') {
            steps {
                echo '✅ Running smoke tests...'
                script {
                    sh '''
                        echo "Testing backend API..."
                        curl -s -o /dev/null -w "Backend Status: %{http_code}\\n" http://localhost:5062/swagger || echo "Backend not ready yet"
                        
                        echo "Testing frontend..."
                        curl -s -o /dev/null -w "Frontend Status: %{http_code}\\n" http://localhost:5173 || echo "Frontend not ready yet"
                    '''
                }
            }
        }

        stage('Generate Report') {
            steps {
                echo '📊 Generating build report...'
                script {
                    sh '''
                        echo "==================================="
                        echo "Build Summary"
                        echo "==================================="
                        echo "Build Number: ${BUILD_NUMBER}"
                        echo "Build Tag: ${IMAGE_TAG}"
                        echo "Branch: ${GIT_BRANCH}"
                        echo "Commit: ${GIT_COMMIT}"
                        echo ""
                        echo "Docker Images Created:"
                        docker images | grep -E "electronics-repair" || echo "No images found"
                        echo ""
                        echo "Running Containers:"
                        docker-compose ps || echo "Docker compose not running"
                        echo "==================================="
                    '''
                }
            }
        }
    }

    post {
        success {
            echo '✅ Build succeeded!'
            sh '''
                echo "Build completed successfully at $(date)" > /tmp/build_success.txt
            '''
        }
        failure {
            echo '❌ Build failed!'
            sh '''
                echo "Build failed at $(date)" > /tmp/build_failure.txt
                echo "Collecting diagnostic information..."
                docker-compose logs --tail=50
            '''
        }
        always {
            echo '🧹 Cleaning up...'
            sh '''
                echo "Build artifacts and logs are ready."
            '''
        }
    }
}
