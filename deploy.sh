#!/bin/bash

# Update and install Docker
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2 git

# Add user to docker group
sudo usermod -aG docker $USER

echo "Docker installed. Please log out and log back in."
