#!/bin/bash

# ECS service update script for Astro Dynamic Text application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
AWS_PROFILE=${AWS_PROFILE:-personal}
AWS_REGION=${AWS_REGION:-us-west-2}

echo -e "${GREEN}🚀 Updating ECS service for Astro Dynamic Text${NC}"

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo -e "${RED}❌ AWS CLI is not installed. Please install it first.${NC}"
    exit 1
fi

# Get cluster and service names from stack outputs
cd "$(dirname "$0")"
if [ ! -f "outputs.json" ]; then
    echo -e "${RED}❌ outputs.json not found. Please run ./deploy-infra.sh first.${NC}"
    exit 1
fi

CLUSTER_NAME=$(cat outputs.json | jq -r '.AstroDynamicTextSSRStack.ClusterName')
SERVICE_NAME=$(cat outputs.json | jq -r '.AstroDynamicTextSSRStack.ServiceName')

if [ "$CLUSTER_NAME" == "null" ] || [ -z "$CLUSTER_NAME" ]; then
    echo -e "${RED}❌ Failed to get cluster name from stack outputs${NC}"
    exit 1
fi

if [ "$SERVICE_NAME" == "null" ] || [ -z "$SERVICE_NAME" ]; then
    echo -e "${RED}❌ Failed to get service name from stack outputs${NC}"
    exit 1
fi

echo -e "${GREEN}🎯 Cluster: $CLUSTER_NAME${NC}"
echo -e "${GREEN}⚙️ Service: $SERVICE_NAME${NC}"

echo -e "${YELLOW}📋 Step 1: Forcing new deployment${NC}"
aws ecs update-service \
    --profile $AWS_PROFILE \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --force-new-deployment \
    --region $AWS_REGION

echo -e "${GREEN}✅ ECS service update initiated successfully!${NC}"

echo -e "${YELLOW}📋 Step 2: Waiting for deployment to complete...${NC}"
aws ecs wait services-stable \
    --profile $AWS_PROFILE \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION

echo -e "${GREEN}✅ Deployment completed successfully!${NC}"

# Display final URLs
CLOUDFRONT_URL=$(cat outputs.json | jq -r '.AstroDynamicTextSSRStack.CloudFrontURL')
ALB_DNS=$(cat outputs.json | jq -r '.AstroDynamicTextSSRStack.LoadBalancerDNS')

echo -e "${GREEN}🌐 Application URLs:${NC}"
echo -e "${GREEN}   CloudFront (Recommended): $CLOUDFRONT_URL${NC}"
echo -e "${GREEN}   Load Balancer: http://$ALB_DNS${NC}"

echo -e "${YELLOW}⏳ Note: It may take a few minutes for CloudFront to reflect the latest changes.${NC}"
echo -e "${YELLOW}📊 You can monitor the deployment in the AWS ECS console.${NC}"