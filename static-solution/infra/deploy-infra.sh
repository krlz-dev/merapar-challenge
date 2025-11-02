#!/bin/bash

# Deploy the Simple Static Stack (S3 + CloudFront)
# This is the simplest possible solution that satisfies both rules

set -e

echo "🪣 Deploying Simple Static Stack (S3 + CloudFront)"
echo "=================================================="

# Check if we're in the right directory
if [ ! -f "cdk.json" ]; then
    echo "❌ Error: Must run from infra directory"
    echo "   cd infra && ./deploy-simple.sh"
    exit 1
fi

# Check if static solution files exist
if [ ! -f "../index.html" ] || [ ! -f "../config.json" ]; then
    echo "❌ Error: Static solution files not found"
    echo "   Make sure index.html and config.json exist in parent directory"
    exit 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing CDK dependencies..."
    npm install
fi

echo "🔨 Building CDK project..."
npm run build

echo "🚀 Deploying Simple Static Stack..."
npx cdk deploy AstroDynamicTextSimpleStack --require-approval never --profile personal