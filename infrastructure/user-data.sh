#!/bin/bash
set -e

# Update packages and install Docker & AWS CLI
apt-get update -y
apt-get install -y docker.io docker-compose-v2 awscli jq

systemctl start docker
systemctl enable docker

mkdir -p /home/ubuntu/taxsathi/backend
cd /home/ubuntu/taxsathi

# Fetch AWS Metadata (Region & Account ID)
AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region || echo "us-east-1")
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text || echo "")

# Securely fetch the backend .env file from AWS Systems Manager (SSM) Parameter Store
# The EC2 instance must have an IAM Role with permission to read this parameter.
aws ssm get-parameter \
    --region $AWS_REGION \
    --name "/taxsathi/prod/backend-env" \
    --with-decryption \
    --query "Parameter.Value" \
    --output text > /home/ubuntu/taxsathi/backend/.env

if [ -n "$AWS_ACCOUNT_ID" ]; then
    REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REGISTRY

    # Pull latest 2 containers from ECR
    docker pull $REGISTRY/taxsathi-frontend:latest
    docker pull $REGISTRY/taxsathi-backend:latest

    # Stop old containers if any
    docker stop taxsathi-frontend taxsathi-backend 2>/dev/null || true
    docker rm taxsathi-frontend taxsathi-backend 2>/dev/null || true

    # Run ONLY 2 containers
    docker run -d --name taxsathi-frontend --restart always -p 3000:3000 $REGISTRY/taxsathi-frontend:latest
    docker run -d --name taxsathi-backend --restart always --env-file /home/ubuntu/taxsathi/backend/.env -p 8000:8000 $REGISTRY/taxsathi-backend:latest
fi

echo "EC2 Auto Scaling Instance Bootstrapped Successfully with 2 Containers!"
