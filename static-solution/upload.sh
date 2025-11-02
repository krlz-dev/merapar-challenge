#!/bin/bash
set -e

# Configuration (from CloudFormation outputs)
BUCKET_NAME="simplest-alternative-944473419677-us-west-2"
DISTRIBUTION_ID="E1AD7KWCIINAEN"
PROFILE="personal"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Static Solution File Uploader${NC}"
echo "==============================="

# Check if file argument provided
if [ $# -eq 0 ]; then
    echo -e "${RED}❌ Error: Please specify a file to upload${NC}"
    echo "Usage: $0 <file> [destination-path]"
    echo ""
    echo "Examples:"
    echo "  $0 index.html        # Upload to root"
    echo "  $0 config.json       # Upload to root"
    echo "  $0 style.css css/    # Upload to css/ folder"
    exit 1
fi

FILE="$1"
DEST_PATH="${2:-}"  # Optional destination path

# Check if file exists
if [ ! -f "$FILE" ]; then
    echo -e "${RED}❌ Error: File '$FILE' not found${NC}"
    exit 1
fi

# Construct S3 destination
if [ -n "$DEST_PATH" ]; then
    S3_DEST="s3://$BUCKET_NAME/$DEST_PATH$(basename "$FILE")"
    INVALIDATION_PATH="/$DEST_PATH$(basename "$FILE")"
else
    S3_DEST="s3://$BUCKET_NAME/$(basename "$FILE")"
    INVALIDATION_PATH="/$(basename "$FILE")"
fi

echo "📁 Source: $FILE"
echo "🪣 Destination: $S3_DEST"

# Upload file to S3
echo -e "${BLUE}📤 Uploading to S3...${NC}"
aws s3 cp "$FILE" "$S3_DEST" --acl public-read --profile "$PROFILE"

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Upload successful!${NC}"
else
    echo -e "${RED}❌ Upload failed!${NC}"
    exit 1
fi

# Invalidate CloudFront cache
echo -e "${BLUE}🔄 Invalidating CloudFront cache...${NC}"
aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "$INVALIDATION_PATH" \
    --profile "$PROFILE" \
    --output table

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Cache invalidation initiated!${NC}"
    echo ""
    echo -e "${GREEN}🌐 Your file will be available at:${NC}"
    echo "https://dpvvtd4bo29tb.cloudfront.net$INVALIDATION_PATH"
    echo ""
    echo -e "${BLUE}ℹ️  Note: Cache invalidation may take 1-2 minutes to complete${NC}"
else
    echo -e "${RED}❌ Cache invalidation failed!${NC}"
    exit 1
fi