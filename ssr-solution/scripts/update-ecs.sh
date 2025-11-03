#!/bin/bash
set -e
AWS_PROFILE=${AWS_PROFILE:-personal}
AWS_REGION=${AWS_REGION:-us-west-2}
IMAGE_TAG=${IMAGE_TAG:-latest}
! command -v aws &> /dev/null && exit 1
cd "$(dirname "$0")/../infra"
[ ! -f "outputs.json" ] && exit 1
CLUSTER_NAME=$(cat outputs.json | jq -r '.AstroDynamicTextSSRStack.ClusterName')
SERVICE_NAME=$(cat outputs.json | jq -r '.AstroDynamicTextSSRStack.ServiceName')
ECR_URI=$(cat outputs.json | jq -r '.AstroDynamicTextSSRStack.ECRRepository')
[ "$CLUSTER_NAME" == "null" ] || [ -z "$CLUSTER_NAME" ] && exit 1
[ "$SERVICE_NAME" == "null" ] || [ -z "$SERVICE_NAME" ] && exit 1
[ "$ECR_URI" == "null" ] || [ -z "$ECR_URI" ] && exit 1
FULL_IMAGE_URI="$ECR_URI:$IMAGE_TAG"
CURRENT_TASK_DEF=$(aws ecs describe-services --profile $AWS_PROFILE --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION --query 'services[0].taskDefinition' --output text)
TASK_DEF_JSON=$(aws ecs describe-task-definition --profile $AWS_PROFILE --task-definition $CURRENT_TASK_DEF --region $AWS_REGION --query 'taskDefinition')
NEW_TASK_DEF=$(echo $TASK_DEF_JSON | jq --arg image "$FULL_IMAGE_URI" '.containerDefinitions[0].image = $image | del(.taskDefinitionArn, .revision, .status, .requiresAttributes, .placementConstraints, .compatibilities, .registeredAt, .registeredBy)')
TEMP_TASK_DEF_FILE=$(mktemp)
echo "$NEW_TASK_DEF" > "$TEMP_TASK_DEF_FILE"
NEW_TASK_DEF_ARN=$(aws ecs register-task-definition --profile $AWS_PROFILE --region $AWS_REGION --cli-input-json "file://$TEMP_TASK_DEF_FILE" --query 'taskDefinition.taskDefinitionArn' --output text)
rm "$TEMP_TASK_DEF_FILE"
aws ecs update-service --profile $AWS_PROFILE --cluster $CLUSTER_NAME --service $SERVICE_NAME --task-definition $NEW_TASK_DEF_ARN --region $AWS_REGION
aws ecs wait services-stable --profile $AWS_PROFILE --cluster $CLUSTER_NAME --services $SERVICE_NAME --region $AWS_REGION
echo "✅ ECS service updated"