#!/bin/bash
set -e
SCRIPT_DIR="$(dirname "$0")"
run_script() {
    [ ! -f "$SCRIPT_DIR/$1" ] && exit 1
    "$SCRIPT_DIR/$1" || exit 1
    echo "✅ $1 success"
}
run_script "deploy-infra.sh"
run_script "build-push.sh"
run_script "update-ecs.sh"
echo "🎉 Full deployment success"