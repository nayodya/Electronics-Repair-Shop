#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Jenkins Setup for Electronics Repair Shop            ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"

# Check Docker
echo -e "\n${YELLOW}📋 Checking prerequisites...${NC}"

if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is installed${NC}"

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker Compose is installed${NC}"

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running. Please start Docker Desktop.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker daemon is running${NC}"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo -e "\n${YELLOW}🔧 Starting Jenkins...${NC}"

cd "$PROJECT_ROOT"

# Check if containers are already running
if docker ps | grep -q "jenkins-master"; then
    echo -e "${YELLOW}⚠️  Jenkins is already running. Stopping it first...${NC}"
    docker-compose -f jenkins/docker-compose-jenkins-simple.yml down
    sleep 2
fi

# Start Jenkins
echo "Starting Jenkins container..."
docker-compose -f jenkins/docker-compose-jenkins-simple.yml up -d

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Jenkins container started${NC}"
else
    echo -e "${RED}❌ Failed to start Jenkins${NC}"
    exit 1
fi

# Wait for Jenkins to be ready
echo -e "\n${YELLOW}⏳ Waiting for Jenkins to start (this may take 60 seconds)...${NC}"

max_attempts=60
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -s http://localhost:8080 > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Jenkins is ready!${NC}"
        break
    fi
    
    attempt=$((attempt + 1))
    if [ $((attempt % 10)) -eq 0 ]; then
        echo "Still waiting... ($attempt seconds)"
    fi
    sleep 1
done

if [ $attempt -ge $max_attempts ]; then
    echo -e "${YELLOW}⚠️  Jenkins may still be starting. Check logs with: docker logs jenkins-master${NC}"
else
    echo -e "${GREEN}✓ Jenkins is fully started${NC}"
fi

# Get initial admin password
echo -e "\n${YELLOW}🔑 Getting Jenkins admin password...${NC}"

sleep 2

JENKINS_PASSWORD=$(docker exec jenkins-master cat /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null)

if [ -z "$JENKINS_PASSWORD" ]; then
    echo -e "${YELLOW}⚠️  Could not retrieve initial password. Jenkins may still be initializing.${NC}"
    echo -e "${YELLOW}Run this command to get the password:${NC}"
    echo -e "${BLUE}docker exec jenkins-master cat /var/jenkins_home/secrets/initialAdminPassword${NC}"
else
    echo -e "${GREEN}✓ Initial Admin Password:${NC} ${BLUE}${JENKINS_PASSWORD}${NC}"
fi

# Display information
echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║            Jenkins Setup Complete!                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"

echo -e "\n${YELLOW}📝 Next Steps:${NC}"
echo -e "1. Open Jenkins UI: ${BLUE}http://localhost:8080${NC}"
echo -e "2. Paste the admin password above"
echo -e "3. Install suggested plugins"
echo -e "4. Create admin user account"
echo -e "5. Create new Pipeline job pointing to your repository"

echo -e "\n${YELLOW}📋 Useful Commands:${NC}"
echo -e "  View logs:              ${BLUE}docker logs -f jenkins-master${NC}"
echo -e "  Check status:           ${BLUE}docker-compose -f jenkins/docker-compose-jenkins-simple.yml ps${NC}"
echo -e "  Stop Jenkins:           ${BLUE}docker-compose -f jenkins/docker-compose-jenkins-simple.yml down${NC}"
echo -e "  Stop and remove data:   ${BLUE}docker-compose -f jenkins/docker-compose-jenkins-simple.yml down -v${NC}"

echo -e "\n${YELLOW}🔗 Important URLs:${NC}"
echo -e "  Jenkins:  ${BLUE}http://localhost:8080${NC}"
echo -e "  Backend:  ${BLUE}http://localhost:5062${NC}"
echo -e "  Frontend: ${BLUE}http://localhost:5173${NC}"

echo -e "\n${GREEN}✓ Setup complete!${NC}\n"
