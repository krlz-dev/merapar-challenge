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
IMAGE_TAG=${IMAGE_TAG:-latest}

echo -e "${GREEN}🚀 Updating ECS service for Astro Dynamic Text${NC}"
echo -e "${GREEN}🏷️ Using image tag: $IMAGE_TAG${NC}"

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
ECR_URI=$(cat outputs.json | jq -r '.AstroDynamicTextSSRStack.ECRRepository')

if [ "$CLUSTER_NAME" == "null" ] || [ -z "$CLUSTER_NAME" ]; then
    echo -e "${RED}❌ Failed to get cluster name from stack outputs${NC}"
    exit 1
fi

if [ "$SERVICE_NAME" == "null" ] || [ -z "$SERVICE_NAME" ]; then
    echo -e "${RED}❌ Failed to get service name from stack outputs${NC}"
    exit 1
fi

if [ "$ECR_URI" == "null" ] || [ -z "$ECR_URI" ]; then
    echo -e "${RED}❌ Failed to get ECR URI from stack outputs${NC}"
    exit 1
fi

# Construct full image URI
FULL_IMAGE_URI="$ECR_URI:$IMAGE_TAG"

echo -e "${GREEN}🎯 Cluster: $CLUSTER_NAME${NC}"
echo -e "${GREEN}⚙️ Service: $SERVICE_NAME${NC}"
echo -e "${GREEN}🖼️ Image: $FULL_IMAGE_URI${NC}"

echo -e "${YELLOW}📋 Step 1: Getting current task definition${NC}"
CURRENT_TASK_DEF=$(aws ecs describe-services \
    --profile $AWS_PROFILE \
    --cluster $CLUSTER_NAME \
    --services $SERVICE_NAME \
    --region $AWS_REGION \
    --query 'services[0].taskDefinition' \
    --output text)

TASK_DEF_FAMILY=$(echo $CURRENT_TASK_DEF | cut -d':' -f1 | cut -d'/' -f2)

echo -e "${YELLOW}📋 Step 2: Creating new task definition with updated image${NC}"
TASK_DEF_JSON=$(aws ecs describe-task-definition \
    --profile $AWS_PROFILE \
    --task-definition $CURRENT_TASK_DEF \
    --region $AWS_REGION \
    --query 'taskDefinition')

# Update the image in the task definition
NEW_TASK_DEF=$(echo $TASK_DEF_JSON | jq --arg image "$FULL_IMAGE_URI" '
    .containerDefinitions[0].image = $image |
    del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .placementConstraints, .compatibilities, .registeredAt, .registeredBy)
')

# Register new task definition
TEMP_TASK_DEF_FILE=$(mktemp)
echo "$NEW_TASK_DEF" > "$TEMP_TASK_DEF_FILE"
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition \
    --profile $AWS_PROFILE \
    --region $AWS_REGION \
    --cli-input-json "file://$TEMP_TASK_DEF_FILE" \
    --query 'taskDefinition.taskDefinitionArn' \
    --output text)
rm "$TEMP_TASK_DEF_FILE"

echo -e "${YELLOW}📋 Step 3: Updating service with new task definition${NC}"
aws ecs update-service \
    --profile $AWS_PROFILE \
    --cluster $CLUSTER_NAME \
    --service $SERVICE_NAME \
    --task-definition $NEW_TASK_DEF_ARN \
    --region $AWS_REGION

echo -e "${GREEN}✅ ECS service update initiated successfully!${NC}"

echo -e "${YELLOW}📋 Step 4: Waiting for deployment to complete...${NC}"
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