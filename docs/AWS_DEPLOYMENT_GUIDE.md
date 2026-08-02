# TaxSathi AWS EC2 & ECR Deployment & Environment Setup Guide

This guide details the step-by-step procedure to set up and deploy TaxSathi on AWS using EC2, ECR, S3, SNS, MongoDB, and GitHub Actions.

---

## 1. Required AWS Infrastructure

### A. AWS Elastic Container Registry (ECR)
Create two private ECR repositories in your AWS region (e.g., `us-east-1`):
1. `taxsathi-backend`
2. `taxsathi-frontend`

### B. AWS Simple Storage Service (S3)
Create a private S3 bucket (e.g. `taxsathi-pdf-storage`):
- **Block all public access:** Enabled.
- **CORS Configuration:**
```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": ["ETag"]
    }
]
```

### C. AWS Simple Notification Service (SNS)
Create an SNS Topic:
- **Topic Name:** `taxsathi-invoice-alerts`
- Copy the **Topic ARN** (e.g. `arn:aws:sns:us-east-1:123456789012:taxsathi-invoice-alerts`).

### D. AWS EC2 Server Setup
Launch an Ubuntu 22.04 LTS instance (minimum recommended: `t3.medium`):
1. Install Docker & Docker Compose:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2 awscli
   sudo usermod -aG docker ubuntu
   ```
2. Attach an IAM role to EC2 with `AmazonEC2ContainerRegistryReadOnly` policies.
3. Create workspace directory on EC2:
   ```bash
   mkdir -p /home/ubuntu/taxsathi
   ```
4. Copy `docker-compose.prod.yml` and `docker/` into `/home/ubuntu/taxsathi/`.
5. Create `/home/ubuntu/taxsathi/backend/.env` with production keys:

```env
APP_NAME=TaxSathi
APP_ENV=production
APP_KEY=base64:YOUR_GENERATED_APP_KEY
APP_DEBUG=false
APP_URL=https://yourdomain.com

# Database (MongoDB)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/taxsathi?retryWrites=true&w=majority
MONGODB_DATABASE=taxsathi

# AWS S3 Storage
FILESYSTEM_DISK=s3
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_DEFAULT_REGION=us-east-1
AWS_BUCKET=taxsathi-pdf-storage

# AWS SNS Notifications
AWS_SNS_TOPIC_ARN=arn:aws:sns:us-east-1:123456789012:taxsathi-invoice-alerts

# Redis Cache
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## 2. GitHub Secrets Setup

Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions** -> Add the following repository secrets:

| Secret Name | Description | Example |
| :--- | :--- | :--- |
| `AWS_ACCESS_KEY_ID` | AWS IAM Access Key for ECR build & push | `AKIAIOSFODNN7EXAMPLE` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM Secret Access Key | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `EC2_HOST` | Public IP address or domain of EC2 server | `54.210.12.34` |
| `EC2_USERNAME` | SSH User for EC2 | `ubuntu` |
| `EC2_SSH_KEY` | Private SSH key (`.pem` file contents) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

---

## 3. Deployment Trigger

Whenever code is pushed to the `main` branch, GitHub Actions automatically:
1. Runs automated tests & Next.js build verification.
2. Builds Docker images for backend & frontend.
3. Pushes container images to **AWS ECR**.
4. Connects via SSH to **AWS EC2** and executes container rolling updates via `docker compose pull` & `docker compose up -d`.
