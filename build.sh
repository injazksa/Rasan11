#!/bin/bash

set -e

echo "🚀 Starting Rasan Platform Build Process..."

# Ensure we are in the root directory
cd /opt/render/project/src || cd $(pwd)

echo "📦 Installing root dependencies..."
npm install --no-audit --no-fund

echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps --no-audit --no-fund
cd ..

echo "🔨 Building frontend with Vite..."
# Run vite build from the root where vite is now installed as a dependency
npx vite build

echo "📁 Copying frontend build to public folder..."
# Create public directory if it doesn't exist
mkdir -p public
# Clean public directory but keep essential files if any
find public -mindepth 1 -maxdepth 1 ! -name 'assets' -exec rm -rf {} + || true
# The vite.config.js is configured to output to 'public' folder in the root
# So the build is already in 'public' if vite build was successful.
# But let's make sure it's there.

echo "✅ Build completed successfully!"
