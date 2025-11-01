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

# Check if simplest-alternative directory exists
if [ ! -d "../simplest-alternative" ]; then
    echo "❌ Error: simplest-alternative directory not found"
    echo "   Make sure you're running from the infra directory"
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
npx cdk deploy AstroDynamicTextSimpleStack --context target=simple --require-approval never --profile personal

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📋 Next steps:"
echo "1. Visit the CloudFront URL shown in the outputs"
echo "2. Update content using the AWS CLI command from outputs"
echo "3. Use cache invalidation for instant updates"
echo ""
echo "💰 Expected monthly cost: $0.10 - $0.60"
echo "⚡ Update time: 1-5 minutes (depending on cache)"
echo ""