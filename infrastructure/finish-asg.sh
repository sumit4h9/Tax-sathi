#!/bin/bash
set -e

AWS_REGION="${AWS_REGION:-eu-north-1}"

echo "Fetching existing infrastructure IDs..."
APP_SG=$(aws ec2 describe-security-groups --filters Name=group-name,Values=taxsathi-app-sg --region $AWS_REGION --query 'SecurityGroups[0].GroupId' --output text)
PRIV_SUBNET_1=$(aws ec2 describe-subnets --filters Name=tag:Name,Values=taxsathi-private-1a --region $AWS_REGION --query 'Subnets[0].SubnetId' --output text)
PRIV_SUBNET_2=$(aws ec2 describe-subnets --filters Name=tag:Name,Values=taxsathi-private-1b --region $AWS_REGION --query 'Subnets[0].SubnetId' --output text)
TG_FRONTEND=$(aws elbv2 describe-target-groups --names taxsathi-frontend-tg --region $AWS_REGION --query 'TargetGroups[0].TargetGroupArn' --output text)
TG_BACKEND=$(aws elbv2 describe-target-groups --names taxsathi-backend-tg --region $AWS_REGION --query 'TargetGroups[0].TargetGroupArn' --output text)

echo "=== 7. Creating IAM Role & Instance Profile for EC2 ==="
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
aws iam create-role --role-name $ROLE_NAME --assume-role-policy-document file://ec2-trust-policy.json > /dev/null 2>&1 || true
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonSSMReadOnlyAccess
aws iam attach-role-policy --role-name $ROLE_NAME --policy-arn arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly

INSTANCE_PROFILE="taxsathi-ec2-profile"
aws iam create-instance-profile --instance-profile-name $INSTANCE_PROFILE > /dev/null 2>&1 || true
aws iam add-role-to-instance-profile --instance-profile-name $INSTANCE_PROFILE --role-name $ROLE_NAME > /dev/null 2>&1 || true
echo "Waiting 15 seconds for IAM permissions to propagate..."
sleep 15 

echo "=== 8. Creating Launch Template ==="
# Fetch latest Ubuntu 24.04 LTS AMI in eu-north-1
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
    --region $AWS_REGION > /dev/null 2>&1 || true

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

echo "=== Finish ASG Script Completed Successfully! ==="
echo "The taxsathi-asg Auto Scaling Group has now been created!"
