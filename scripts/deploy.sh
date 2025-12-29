#!/bin/bash
# Deploy script for Knockout FPL
# Usage: ./scripts/deploy.sh [target]
#   target: all (default), frontend, backend, functions, dataconnect

set -e

PROJECT="knockoutfpl-dev"
TARGET="${1:-all}"

echo "🚀 Deploying to $PROJECT..."
echo ""

deploy_frontend() {
    echo "📦 Building frontend..."
    npx vite build

    echo "🌐 Deploying frontend to Firebase Hosting..."
    firebase deploy --only hosting --project "$PROJECT"
    echo "✅ Frontend deployed: https://$PROJECT.web.app"
}

deploy_functions() {
    echo "⚡ Deploying Cloud Functions..."
    firebase deploy --only functions --project "$PROJECT"
    echo "✅ Cloud Functions deployed"
}

deploy_dataconnect() {
    echo "🔗 Deploying Data Connect schema..."
    firebase deploy --only dataconnect --project "$PROJECT"
    echo "✅ Data Connect deployed"
}

deploy_backend() {
    deploy_dataconnect
    echo ""
    deploy_functions
}

case "$TARGET" in
    frontend|fe|hosting)
        deploy_frontend
        ;;
    functions|fn)
        deploy_functions
        ;;
    dataconnect|dc|schema)
        deploy_dataconnect
        ;;
    backend|be)
        deploy_backend
        ;;
    all)
        deploy_backend
        echo ""
        deploy_frontend
        ;;
    *)
        echo "Unknown target: $TARGET"
        echo "Usage: ./scripts/deploy.sh [all|frontend|backend|functions|dataconnect]"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
