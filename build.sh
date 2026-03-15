#!/bin/bash

set -e

echo "🚀 Starting Rasan Platform Build Process..."

echo "📦 Installing root dependencies..."
npm install --no-audit --no-fund

echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps --no-audit --no-fund
cd ..

echo "🔨 Building frontend with Vite..."
cd frontend
# Ensure vite is available
npm install vite @vitejs/plugin-react --no-audit --no-fund
npx vite build
cd ..

echo "📁 Copying frontend build to public folder..."
# Create public directory if it doesn't exist
mkdir -p public
# Clean public directory but keep essential files if any
find public -mindepth 1 -maxdepth 1 ! -name 'assets' -exec rm -rf {} + || true
cp -r frontend/dist/* public/

echo "✅ Build completed successfully!"
