#!/bin/bash
set -e
AWS_PROFILE=${AWS_PROFILE:-personal}
AWS_REGION=${AWS_REGION:-us-west-2}
! command -v aws &> /dev/null && exit 1
! command -v cdk &> /dev/null && npm install -g aws-cdk
cd "$(dirname "$0")/../infra"
npm install
npm run build
cdk bootstrap --profile $AWS_PROFILE --region $AWS_REGION
cdk deploy --profile $AWS_PROFILE --require-approval never --outputs-file outputs.json
echo "✅ Infrastructure deployed"