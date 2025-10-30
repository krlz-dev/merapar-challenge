#!/bin/bash

# Main deployment orchestrator for Astro Dynamic Text application

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_PROFILE=${AWS_PROFILE:-personal}
AWS_REGION=${AWS_REGION:-us-west-2}

echo -e "${GREEN}🚀 Starting full deployment of Astro Dynamic Text application${NC}"

# Get script directory
SCRIPT_DIR="$(dirname "$0")"

# Function to run a script and check exit code
run_script() {
    local script_name=$1
    local description=$2
    
    echo -e "${BLUE}▶️ Running $script_name - $description${NC}"
    
    if [ ! -f "$SCRIPT_DIR/$script_name" ]; then
        echo -e "${RED}❌ Script $script_name not found in $SCRIPT_DIR${NC}"
        exit 1
    fi
    
    if ! "$SCRIPT_DIR/$script_name"; then
        echo -e "${RED}❌ $script_name failed${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ $script_name completed successfully${NC}"
    echo ""
}

# Stage 1: Deploy Infrastructure
run_script "deploy-infra.sh" "Deploy AWS infrastructure (VPC, ECS, ECR, etc.)"

# Stage 2: Build and Push Docker Image
run_script "build-push.sh" "Build Astro app and push Docker image to ECR"

# Stage 3: Update ECS Service
run_script "update-ecs.sh" "Update ECS service with new Docker image"

echo -e "${GREEN}🎉 Full deployment completed successfully!${NC}"
echo -e "${YELLOW}💡 Individual scripts can also be run separately:${NC}"
echo -e "${YELLOW}   ./deploy-infra.sh - Deploy infrastructure only${NC}"
echo -e "${YELLOW}   ./build-push.sh   - Build and push image only${NC}"
echo -e "${YELLOW}   ./update-ecs.sh   - Update ECS service only${NC}"