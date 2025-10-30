#!/bin/bash

# Infrastructure deployment script for Astro Dynamic Text application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_PROFILE=${AWS_PROFILE:-personal}
AWS_REGION=${AWS_REGION:-us-west-2}
STACK_NAME=${STACK_NAME:-InfraStack}

echo -e "${GREEN}🏗️ Deploying infrastructure for Astro Dynamic Text application${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if CDK is installed
if ! command -v cdk &> /dev/null; then
    echo -e "${RED}❌ AWS CDK is not installed. Installing...${NC}"
    npm install -g aws-cdk
fi

echo -e "${YELLOW}📋 Step 1: Building CDK project${NC}"
cd "$(dirname "$0")"
npm install
npm run build

echo -e "${YELLOW}📋 Step 2: Bootstrapping CDK (if needed)${NC}"
cdk bootstrap --profile $AWS_PROFILE --region $AWS_REGION

echo -e "${YELLOW}📋 Step 3: Deploying infrastructure${NC}"
cdk deploy --profile $AWS_PROFILE --require-approval never --outputs-file outputs.json

echo -e "${GREEN}✅ Infrastructure deployed successfully!${NC}"

# Display outputs
if [ -f "outputs.json" ]; then
    ECR_URI=$(cat outputs.json | jq -r '.InfraStack.ECRRepository')
    CLOUDFRONT_URL=$(cat outputs.json | jq -r '.InfraStack.CloudFrontURL')
    ALB_DNS=$(cat outputs.json | jq -r '.InfraStack.LoadBalancerDNS')
    
    echo -e "${GREEN}📦 ECR Repository: $ECR_URI${NC}"
    echo -e "${GREEN}🌐 CloudFront URL: $CLOUDFRONT_URL${NC}"
    echo -e "${GREEN}🔗 Load Balancer: http://$ALB_DNS${NC}"
else
    echo -e "${YELLOW}⚠️ outputs.json not found. Infrastructure deployed but outputs unavailable.${NC}"
fi

echo -e "${YELLOW}💡 Next steps:${NC}"
echo -e "${YELLOW}   1. Run ./build-push.sh to build and push your Docker image${NC}"
echo -e "${YELLOW}   2. Run ./update-ecs.sh to update the ECS service${NC}"