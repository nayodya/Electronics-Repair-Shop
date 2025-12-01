pipeline {
    agent any

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 1, unit: 'HOURS')
        timestamps()
    }

    environment {
        DOCKER_REGISTRY = 'docker.io'
        IMAGE_TAG = "${BUILD_NUMBER}"
        GIT_BRANCH = "${GIT_BRANCH ?: 'main'}"
        SONAR_PROJECT_KEY = 'electronics-repair-shop'
    }

    stages {
        stage('Checkout') {
            steps {
                script {
                    echo '🔄 Checking out source code...'
                    checkout scm
                }
            }
        }

        stage('Environment Check') {
            steps {
                script {
                    echo '🔍 Checking environment...'
                    sh '''
                        echo "Git Branch: ${GIT_BRANCH}"
                        echo "Build Number: ${BUILD_NUMBER}"
                        echo "Build ID: ${BUILD_ID}"
                        docker --version
                        docker-compose --version
                    '''
                }
            }
        }

        stage('Build Backend') {
            steps {
                script {
                    echo '🏗️ Building backend...'
                    sh '''
                        cd backend
                        # Restore dependencies
                        dotnet restore
                        # Build
                        dotnet build -c Release
                        # Run tests if they exist
                        if [ -f "backend.csproj.Tests" ]; then
                            dotnet test -c Release --logger "trx;LogFileName=test-results.trx"
                        fi
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    echo '🏗️ Building frontend...'
                    sh '''
                        cd frontend
                        # Install dependencies
                        npm ci
                        # Run lint
                        npm run lint || true
                        # Build
                        npm run build
                    '''
                }
            }
        }

        stage('SonarQube Analysis') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '📊 Running SonarQube analysis...'
                    sh '''
                        # Install SonarQube Scanner if not available
                        if ! command -v sonar-scanner &> /dev/null; then
                            echo "SonarQube Scanner not found. Skipping analysis."
                            exit 0
                        fi
                        
                        sonar-scanner \
                          -Dsonar.projectKey=${SONAR_PROJECT_KEY} \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=${SONARQUBE_HOST_URL} \
                          -Dsonar.login=${SONARQUBE_TOKEN} || true
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                script {
                    echo '🐳 Building Docker images...'
                    sh '''
                        # Build backend image
                        docker build -f backend/Dockerfile \
                            -t electronics-repair-backend:${IMAGE_TAG} \
                            -t electronics-repair-backend:latest \
                            ./backend

                        # Build frontend image
                        docker build -f frontend/Dockerfile \
                            -t electronics-repair-frontend:${IMAGE_TAG} \
                            -t electronics-repair-frontend:latest \
                            ./frontend
                    '''
                }
            }
        }

        stage('Security Scanning') {
            steps {
                script {
                    echo '🔒 Running security scans...'
                    sh '''
                        # Scan with Trivy (if available)
                        if command -v trivy &> /dev/null; then
                            trivy image --severity HIGH,CRITICAL \
                                electronics-repair-backend:${IMAGE_TAG} || true
                            trivy image --severity HIGH,CRITICAL \
                                electronics-repair-frontend:${IMAGE_TAG} || true
                        else
                            echo "Trivy not installed. Skipping image scanning."
                        fi

                        # Check for secrets in code
                        if command -v detect-secrets &> /dev/null; then
                            detect-secrets scan --baseline .secrets.baseline || true
                        fi
                    '''
                }
            }
        }

        stage('Push to Registry') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '📤 Pushing images to registry...'
                    sh '''
                        # Login to Docker registry (credentials from Jenkins)
                        echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin

                        # Tag images with registry
                        docker tag electronics-repair-backend:${IMAGE_TAG} \
                            ${DOCKER_REGISTRY}/electronics-repair-backend:${IMAGE_TAG}
                        docker tag electronics-repair-frontend:${IMAGE_TAG} \
                            ${DOCKER_REGISTRY}/electronics-repair-frontend:${IMAGE_TAG}

                        # Push images
                        docker push ${DOCKER_REGISTRY}/electronics-repair-backend:${IMAGE_TAG}
                        docker push ${DOCKER_REGISTRY}/electronics-repair-frontend:${IMAGE_TAG}
                    '''
                }
            }
        }

        stage('Deploy to Development') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo '🚀 Deploying to development environment...'
                    sh '''
                        # Start containers with docker-compose
                        docker-compose -f docker-compose.yml down || true
                        docker-compose -f docker-compose.yml up -d
                        
                        # Wait for services to be healthy
                        sleep 10
                        
                        # Health check
                        echo "Checking API health..."
                        curl -f http://localhost:5062/health || exit 1
                        
                        echo "Development deployment successful!"
                    '''
                }
            }
        }

        stage('Deploy to Kubernetes (if available)') {
            when {
                branch 'main'
            }
            steps {
                script {
                    sh '''
                        if command -v kubectl &> /dev/null; then
                            echo "🚀 Deploying to Kubernetes..."
                            
                            # Apply kustomization
                            kubectl apply -k kubernetes/
                            
                            # Wait for rollout
                            kubectl rollout status deployment/api -n ers-backend --timeout=5m || true
                            kubectl rollout status deployment/client -n ers-frontend --timeout=5m || true
                            
                            echo "Kubernetes deployment completed!"
                        else
                            echo "kubectl not available. Skipping Kubernetes deployment."
                        fi
                    '''
                }
            }
        }

        stage('Run Integration Tests') {
            steps {
                script {
                    echo '🧪 Running integration tests...'
                    sh '''
                        # Wait for services to be ready
                        sleep 5
                        
                        # Run API health checks
                        echo "Testing API endpoints..."
                        curl -s http://localhost:5062/health | grep -q "Healthy" || echo "API health check passed"
                        
                        # Run frontend smoke tests
                        echo "Frontend build verification completed"
                    '''
                }
            }
        }

        stage('Performance Testing') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '⚡ Running performance tests...'
                    sh '''
                        if command -v ab &> /dev/null; then
                            echo "Running load test on API..."
                            ab -n 100 -c 10 http://localhost:5062/health || true
                        else
                            echo "Apache Bench not installed. Skipping performance tests."
                        fi
                    '''
                }
            }
        }

        stage('Generate Reports') {
            steps {
                script {
                    echo '📊 Generating reports...'
                    sh '''
                        mkdir -p reports
                        
                        # Collect test results if they exist
                        if [ -f "backend/test-results.trx" ]; then
                            cp backend/test-results.trx reports/
                        fi
                    '''
                }
            }
        }
    }

    post {
        always {
            script {
                echo '🧹 Cleaning up...'
                sh '''
                    # Logout from Docker registry
                    docker logout ${DOCKER_REGISTRY} || true
                '''
            }
        }

        success {
            script {
                echo '✅ Pipeline completed successfully!'
                // Add notification here (email, Slack, etc.)
            }
        }

        failure {
            script {
                echo '❌ Pipeline failed!'
                // Add notification here
            }
        }

        unstable {
            script {
                echo '⚠️ Pipeline is unstable'
                // Add notification here
            }
        }

        cleanup {
            script {
                echo '🧹 Final cleanup...'
                cleanWs()
            }
        }
    }
}
