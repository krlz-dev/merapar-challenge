#!/bin/bash
set -e
AWS_PROFILE=${AWS_PROFILE:-personal}
AWS_REGION=${AWS_REGION:-us-west-2}
ECR_REPO_NAME="astro-ssr-dynamic-text"
! command -v docker &> /dev/null && exit 1
! command -v aws &> /dev/null && exit 1
cd "$(dirname "$0")/../infra"
ECR_URI=""
[ -f "outputs.json" ] && ECR_URI=$(cat outputs.json | jq -r '.AstroDynamicTextSSRStack.ECRRepository' 2>/dev/null || echo "")
if [ -z "$ECR_URI" ] || [ "$ECR_URI" == "null" ]; then
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --profile $AWS_PROFILE --query 'Account' --output text)
    [ -z "$AWS_ACCOUNT_ID" ] && exit 1
    ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"
fi
aws ecr get-login-password --profile $AWS_PROFILE --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI
cd ..
VERSION=$(cat package.json | jq -r '.version' 2>/dev/null || echo "0.0.1")
docker build -t $ECR_REPO_NAME .
docker tag $ECR_REPO_NAME:latest $ECR_URI:latest
docker tag $ECR_REPO_NAME:latest $ECR_URI:$VERSION
docker push $ECR_URI:latest
docker push $ECR_URI:$VERSION
echo "✅ Image pushed"