#!/bin/bash

# TaxSathi Automated AWS VPC, Multi-AZ Subnets, ALB & Auto Scaling Group Provisioning Script
set -e

AWS_REGION="${AWS_REGION:-us-east-1}"
VPC_NAME="taxsathi-vpc"
VPC_CIDR="10.0.0.0/16"

echo "=== 1. Creating VPC: $VPC_NAME ($VPC_CIDR) in $AWS_REGION ==="
VPC_ID=$(aws ec2 create-vpc --cidr-block $VPC_CIDR --region $AWS_REGION --query 'Vpc.VpcId' --output text)
aws ec2 create-tags --resources $VPC_ID --tags Key=Name,Value=$VPC_NAME --region $AWS_REGION
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames '{"Value":true}' --region $AWS_REGION
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support '{"Value":true}' --region $AWS_REGION

echo "VPC Created: $VPC_ID"

echo "=== 2. Creating Internet Gateway ==="
IGW_ID=$(aws ec2 create-internet-gateway --region $AWS_REGION --query 'InternetGateway.InternetGatewayId' --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID --region $AWS_REGION
aws ec2 create-tags --resources $IGW_ID --tags Key=Name,Value=taxsathi-igw --region $AWS_REGION

echo "=== 3. Creating Multi-AZ Subnets ==="
# Public Subnets (AZ-a & AZ-b)
PUB_SUBNET_1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.1.0/24 --availability-zone ${AWS_REGION}a --region $AWS_REGION --query 'Subnet.SubnetId' --output text)
PUB_SUBNET_2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.2.0/24 --availability-zone ${AWS_REGION}b --region $AWS_REGION --query 'Subnet.SubnetId' --output text)
aws ec2 modify-subnet-attribute --subnet-id $PUB_SUBNET_1 --map-public-ip-on-launch --region $AWS_REGION
aws ec2 modify-subnet-attribute --subnet-id $PUB_SUBNET_2 --map-public-ip-on-launch --region $AWS_REGION

# Private Subnets (AZ-a & AZ-b)
PRIV_SUBNET_1=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.10.0/24 --availability-zone ${AWS_REGION}a --region $AWS_REGION --query 'Subnet.SubnetId' --output text)
PRIV_SUBNET_2=$(aws ec2 create-subnet --vpc-id $VPC_ID --cidr-block 10.0.20.0/24 --availability-zone ${AWS_REGION}b --region $AWS_REGION --query 'Subnet.SubnetId' --output text)

aws ec2 create-tags --resources $PUB_SUBNET_1 --tags Key=Name,Value=taxsathi-public-1a --region $AWS_REGION
aws ec2 create-tags --resources $PUB_SUBNET_2 --tags Key=Name,Value=taxsathi-public-1b --region $AWS_REGION
aws ec2 create-tags --resources $PRIV_SUBNET_1 --tags Key=Name,Value=taxsathi-private-1a --region $AWS_REGION
aws ec2 create-tags --resources $PRIV_SUBNET_2 --tags Key=Name,Value=taxsathi-private-1b --region $AWS_REGION

echo "=== 4. Setting up Route Tables & NAT Gateway ==="
PUB_RT=$(aws ec2 create-route-table --vpc-id $VPC_ID --region $AWS_REGION --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $PUB_RT --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW_ID --region $AWS_REGION
aws ec2 associate-route-table --subnet-id $PUB_SUBNET_1 --route-table-id $PUB_RT --region $AWS_REGION
aws ec2 associate-route-table --subnet-id $PUB_SUBNET_2 --route-table-id $PUB_RT --region $AWS_REGION

# EIP & NAT Gateway for Private Subnets
EIP_ALLOC=$(aws ec2 allocate-address --domain vpc --region $AWS_REGION --query 'AllocationId' --output text)
NAT_GW=$(aws ec2 create-nat-gateway --subnet-id $PUB_SUBNET_1 --allocation-id $EIP_ALLOC --region $AWS_REGION --query 'NatGateway.NatGatewayId' --output text)

echo "Waiting for NAT Gateway to become available..."
aws ec2 wait nat-gateway-available --nat-gateway-ids $NAT_GW --region $AWS_REGION

PRIV_RT=$(aws ec2 create-route-table --vpc-id $VPC_ID --region $AWS_REGION --query 'RouteTable.RouteTableId' --output text)
aws ec2 create-route --route-table-id $PRIV_RT --destination-cidr-block 0.0.0.0/0 --nat-gateway-id $NAT_GW --region $AWS_REGION
aws ec2 associate-route-table --subnet-id $PRIV_SUBNET_1 --route-table-id $PRIV_RT --region $AWS_REGION
aws ec2 associate-route-table --subnet-id $PRIV_SUBNET_2 --route-table-id $PRIV_RT --region $AWS_REGION

echo "=== 5. Creating Security Groups ==="
# ALB Security Group
ALB_SG=$(aws ec2 create-security-group --group-name taxsathi-alb-sg --description "ALB Security Group" --vpc-id $VPC_ID --region $AWS_REGION --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 80 --cidr 0.0.0.0/0 --region $AWS_REGION
aws ec2 authorize-security-group-ingress --group-id $ALB_SG --protocol tcp --port 443 --cidr 0.0.0.0/0 --region $AWS_REGION

# EC2 App Security Group
APP_SG=$(aws ec2 create-security-group --group-name taxsathi-app-sg --description "EC2 Application Security Group" --vpc-id $VPC_ID --region $AWS_REGION --query 'GroupId' --output text)
aws ec2 authorize-security-group-ingress --group-id $APP_SG --protocol tcp --port 3000 --source-group $ALB_SG --region $AWS_REGION
aws ec2 authorize-security-group-ingress --group-id $APP_SG --protocol tcp --port 8000 --source-group $ALB_SG --region $AWS_REGION
aws ec2 authorize-security-group-ingress --group-id $APP_SG --protocol tcp --port 22 --cidr 0.0.0.0/0 --region $AWS_REGION

echo "=== 6. Creating Target Groups & Application Load Balancer (ALB) ==="
TG_FRONTEND=$(aws elbv2 create-target-group --name taxsathi-frontend-tg --protocol HTTP --port 3000 --vpc-id $VPC_ID --health-check-path / --region $AWS_REGION --query 'TargetGroups[0].TargetGroupArn' --output text)
TG_BACKEND=$(aws elbv2 create-target-group --name taxsathi-backend-tg --protocol HTTP --port 8000 --vpc-id $VPC_ID --health-check-path /api/health --region $AWS_REGION --query 'TargetGroups[0].TargetGroupArn' --output text)

ALB_ARN=$(aws elbv2 create-load-balancer --name taxsathi-alb --subnets $PUB_SUBNET_1 $PUB_SUBNET_2 --security-groups $ALB_SG --region $AWS_REGION --query 'LoadBalancers[0].LoadBalancerArn' --output text)

# Default HTTP Listener routing to Frontend
LISTENER_ARN=$(aws elbv2 create-listener --load-balancer-arn $ALB_ARN --protocol HTTP --port 80 --default-actions Type=forward,TargetGroupArn=$TG_FRONTEND --region $AWS_REGION --query 'Listeners[0].ListenerArn' --output text)

# Rule for routing /api/* to Backend
aws elbv2 create-rule --listener-arn $LISTENER_ARN --conditions Field=path-pattern,Values='/api/*' --priority 10 --actions Type=forward,TargetGroupArn=$TG_BACKEND --region $AWS_REGION

echo "=== 7. Creating IAM Role & Instance Profile for EC2 ==="
# Role Trust Policy for EC2
cat > ec2-trust-policy.json <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ec2.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

ROLE_NAME="taxsathi-ec2-role"
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://ec2-trust-policy.json > /dev/null || true
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly

INSTANCE_PROFILE="taxsathi-ec2-profile"
aws iam create-instance-profile --instance-profile-name $INSTANCE_PROFILE > /dev/null || true
aws iam add-role-to-instance-profile --instance-profile-name $INSTANCE_PROFILE --role-name $ROLE_NAME > /dev/null || true
sleep 10 # Wait for IAM propagation

echo "=== 8. Creating Launch Template ==="
# Fetch latest Ubuntu 24.04 LTS AMI
AMI_ID=$(aws ec2 describe-images --owners 099720109477 --filters "Name=name,Values=ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*" "Name=state,Values=available" --query "sort_by(Images, &CreationDate)[-1].ImageId" --output text --region $AWS_REGION)

USER_DATA_B64=$(base64 -w 0 infrastructure/user-data.sh)

aws ec2 create-launch-template \
    --launch-template-name taxsathi-lt \
    --version-description "Initial Version" \
    --launch-template-data "{
        \"ImageId\":\"$AMI_ID\",
        \"InstanceType\":\"t3.medium\",
        \"SecurityGroupIds\":[\"$APP_SG\"],
        \"IamInstanceProfile\":{\"Name\":\"$INSTANCE_PROFILE\"},
        \"UserData\":\"$USER_DATA_B64\"
    }" \
    --region $AWS_REGION > /dev/null

echo "=== 9. Creating Auto Scaling Group ==="
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name taxsathi-asg \
    --launch-template LaunchTemplateName=taxsathi-lt,Version='$Latest' \
    --min-size 1 \
    --max-size 3 \
    --desired-capacity 1 \
    --vpc-zone-identifier "$PRIV_SUBNET_1,$PRIV_SUBNET_2" \
    --target-group-arns "$TG_FRONTEND" "$TG_BACKEND" \
    --region $AWS_REGION

rm -f ec2-trust-policy.json

echo "=== Provisioning Completed Successfully ==="
echo "VPC ID: $VPC_ID"
echo "Public Subnets: $PUB_SUBNET_1, $PUB_SUBNET_2"
echo "Private Subnets: $PRIV_SUBNET_1, $PRIV_SUBNET_2"
echo "ALB ARN: $ALB_ARN"
echo "Auto Scaling Group 'taxsathi-asg' created with Desired Capacity of 1"
