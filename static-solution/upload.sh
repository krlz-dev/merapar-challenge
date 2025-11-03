#!/bin/bash
set -e

BUCKET="simplest-alternative-944473419677-us-west-2"
DIST="E1AD7KWCIINAEN"
PROFILE="personal"

[ $# -eq 0 ] && { echo "Usage: $0 <file>"; exit 1; }
[ ! -f "$1" ] && { echo "File not found"; exit 1; }

aws s3 cp "$1" "s3://$BUCKET/" --profile "$PROFILE"
aws cloudfront create-invalidation --distribution-id "$DIST" --paths "/$(basename "$1")" --profile "$PROFILE" > /dev/null

echo "https://dpvvtd4bo29tb.cloudfront.net/$(basename "$1")"