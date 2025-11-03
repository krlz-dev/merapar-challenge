#!/bin/bash
set -e
cd "$(dirname "$0")/../infra"
[ ! -f "cdk.json" ] && exit 1
[ ! -f "../index.html" ] || [ ! -f "../config.json" ] && exit 1
[ ! -d "node_modules" ] && npm install
npm run build
npx cdk deploy AstroDynamicTextSimpleStack --require-approval never --profile personal
echo "✅ Static deployment success"