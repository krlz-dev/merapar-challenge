#!/bin/bash

# Docker build and push script for Astro Dynamic Text application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_PROFILE=${AWS_PROFILE:-personal}
AWS_REGION=${AWS_REGION:-us-west-2}
ECR_REPO_NAME="astro-ssr-dynamic-text"

echo -e "${GREEN}🐳 Building and pushing Docker image for Astro Dynamic Text${NC}"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Get ECR repository URI from stack outputs or construct it
cd "$(dirname "$0")"

# Try to get from outputs.json first
ECR_URI=""
if [ -f "outputs.json" ]; then
    ECR_URI=$(cat outputs.json | jq -r '.AstroDynamicTextSSRStack.ECRRepository' 2>/dev/null || echo "")
fi

# If outputs.json doesn't exist or ECR_URI is empty/null, construct it
if [ -z "$ECR_URI" ] || [ "$ECR_URI" == "null" ]; then
    echo -e "${YELLOW}⚠️ outputs.json not found or incomplete. Constructing ECR URI...${NC}"
    
    # Get AWS account ID
    AWS_ACCOUNT_ID=$(aws sts get-caller-identity --profile $AWS_PROFILE --query 'Account' --output text)
    if [ -z "$AWS_ACCOUNT_ID" ]; then
        echo -e "${RED}❌ Failed to get AWS account ID${NC}"
        exit 1
    fi
    
    ECR_URI="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"
    echo -e "${YELLOW}🔧 Using constructed ECR URI: $ECR_URI${NC}"
fi

echo -e "${GREEN}📦 ECR Repository: $ECR_URI${NC}"

echo -e "${YELLOW}📋 Step 1: Logging into ECR${NC}"
aws ecr get-login-password --profile $AWS_PROFILE --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_URI

# Go to application root
cd ..

# Get version from package.json
VERSION=$(cat package.json | jq -r '.version' 2>/dev/null || echo "0.0.1")
echo -e "${GREEN}📦 Application version: $VERSION${NC}"

echo -e "${YELLOW}📋 Step 2: Building Docker image${NC}"
docker build -t $ECR_REPO_NAME .

echo -e "${YELLOW}📋 Step 3: Tagging image for ECR${NC}"
docker tag $ECR_REPO_NAME:latest $ECR_URI:latest
docker tag $ECR_REPO_NAME:latest $ECR_URI:$VERSION

echo -e "${YELLOW}📋 Step 4: Pushing image to ECR${NC}"
docker push $ECR_URI:latest
docker push $ECR_URI:$VERSION

echo -e "${GREEN}✅ Docker image built and pushed successfully!${NC}"
echo -e "${GREEN}🏷️ Image URIs:${NC}"
echo -e "${GREEN}   - Latest: $ECR_URI:latest${NC}"
echo -e "${GREEN}   - Version: $ECR_URI:$VERSION${NC}"

echo -e "${YELLOW}💡 Next step: Run ./update-ecs.sh to update the ECS service${NC}"