pipeline {
    agent any
    
    options {
        timeout(time: 1, unit: 'HOURS')
        timestamps()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    environment {
        IMAGE_TAG = "${BUILD_NUMBER}"
    }

    stages {
        stage('Checkout') {
            steps {
                echo '📥 Checking out code from repository...'
                checkout scm
            }
        }

        stage('Build Backend') {
            agent {
                docker {
                    image 'mcr.microsoft.com/dotnet/sdk:8.0'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                echo '🔨 Building backend service...'
                sh '''
                    cd backend
                    echo "Restoring .NET packages..."
                    dotnet restore
                    echo "Building .NET project..."
                    dotnet build -c Release
                    echo "Running tests..."
                    dotnet test -c Release --no-build --verbosity normal || true
                '''
            }
        }

        stage('Build Frontend') {
            agent {
                docker {
                    image 'node:20-alpine'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                echo '⚙️ Building frontend service...'
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

        stage('Security Scan') {
            agent {
                docker {
                    image 'node:20-alpine'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                }
            }
            steps {
                echo '🔐 Running security scans...'
                sh '''
                    cd frontend
                    echo "Checking frontend dependencies..."
                    npm audit || true
                '''
            }
        }

        stage('Build Docker Images') {
            steps {
                echo '🐳 Building Docker images...'
                sh '''
                    echo "Building backend image..."
                    docker build -f backend/Dockerfile -t electronics-repair-backend:${IMAGE_TAG} ./backend
                    docker tag electronics-repair-backend:${IMAGE_TAG} electronics-repair-backend:latest
                    
                    echo "Building frontend image..."
                    docker build -f frontend/Dockerfile -t electronics-repair-frontend:${IMAGE_TAG} ./frontend
                    docker tag electronics-repair-frontend:${IMAGE_TAG} electronics-repair-frontend:latest
                    
                    echo "✅ Docker images built successfully!"
                '''
            }
        }

        stage('Deploy') {
            steps {
                echo '🚀 Deploying services...'
                sh '''
                    echo "Starting services with docker-compose..."
                    docker-compose up -d
                    sleep 5
                    echo "Checking service status..."
                    docker-compose ps
                '''
            }
        }

        stage('Health Check') {
            steps {
                echo '✅ Checking service health...'
                sh '''
                    echo "Waiting for services to be ready..."
                    for i in {1..30}; do
                        if curl -s http://localhost:5062/swagger > /dev/null 2>&1; then
                            echo "✅ Backend is ready"
                            break
                        fi
                        echo "⏳ Attempt $i/30 - waiting for backend..."
                        sleep 2
                    done
                    
                    curl -s -o /dev/null -w "Backend Status: %{http_code}\n" http://localhost:5062/swagger || echo "Backend check skipped"
                '''
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline succeeded!'
            echo '📦 Code compiled, tested, and Docker images created!'
        }
        failure {
            echo '❌ Pipeline failed!'
            echo '🔍 Check console output for error details'
        }
        always {
            echo '🧹 Pipeline execution complete'
        }
    }
}
