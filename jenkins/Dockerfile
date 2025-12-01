FROM jenkins/jenkins:lts-jdk17

# Switch to root to install docker
USER root

# Install Docker CLI and dependencies
RUN apt-get update && apt-get install -y \
    docker.io \
    git \
    curl \
    wget \
    apt-transport-https \
    ca-certificates \
    gnupg \
    lsb-release \
    && rm -rf /var/lib/apt/lists/*

# Add jenkins user to docker group
RUN groupmod -g 999 docker || groupadd -g 999 docker && usermod -aG docker jenkins

# Switch back to jenkins user
USER jenkins

# Install common Jenkins plugins
RUN jenkins-plugin-cli --plugins \
    docker-plugin \
    docker-workflow \
    pipeline-model-definition \
    blueocean \
    git \
    timestamper \
    ws-cleanup
