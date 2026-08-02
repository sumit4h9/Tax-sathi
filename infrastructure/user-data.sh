#!/bin/bash
set -e

# Update packages and install Docker & AWS CLI
apt-get update -y
apt-get install -y docker.io docker-compose-v2 jq unzip

curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip -q awscliv2.zip
./aws/install

systemctl start docker
systemctl enable docker

mkdir -p /home/ubuntu/taxsathi/backend
cd /home/ubuntu/taxsathi

# Fetch AWS Metadata (Region & Account ID) using IMDSv2
TOKEN=$(curl -s -X PUT "http://169.254.169.254/latest/api/token" -H "X-aws-ec2-metadata-token-ttl-seconds: 21600")
AWS_REGION=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/meta-data/placement/region || echo "eu-north-1")
AWS_ACCOUNT_ID=$(curl -s -H "X-aws-ec2-metadata-token: $TOKEN" http://169.254.169.254/latest/dynamic/instance-identity/document | jq -r .accountId)

# Retry fetching the SSM parameter up to 5 times (in case IAM role takes a few seconds to attach)
for i in {1..5}; do
    aws ssm get-parameter \
        --region $AWS_REGION \
        --name "/taxsathi/prod/backend-env" \
        --with-decryption \
        --query "Parameter.Value" \
        --output text > /home/ubuntu/taxsathi/backend/.env && break || sleep 5
done

if [ -n "$AWS_ACCOUNT_ID" ]; then
    REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    
    # Retry ECR login up to 5 times
    for i in {1..5}; do
        aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $REGISTRY && break || sleep 5
    done

    # Pull latest 2 containers from ECR
    docker pull $REGISTRY/taxsathi-frontend:latest
    docker pull $REGISTRY/taxsathi-backend:latest

    # Stop old containers if any
    docker stop taxsathi-frontend taxsathi-backend 2>/dev/null || true
    docker rm taxsathi-frontend taxsathi-backend 2>/dev/null || true

    # Run ONLY 2 containers
    docker run -d --name taxsathi-frontend --restart always -p 3000:3000 $REGISTRY/taxsathi-frontend:latest
    docker run -d --name taxsathi-backend --restart always --env-file /home/ubuntu/taxsathi/backend/.env -p 8000:10000 $REGISTRY/taxsathi-backend:latest
fi

echo "EC2 Auto Scaling Instance Bootstrapped Successfully with 2 Containers!"
