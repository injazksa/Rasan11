#!/bin/bash

set -e

echo "🚀 Starting Rasan Platform Build Process..."

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing frontend dependencies..."
cd frontend
npm install --legacy-peer-deps
cd ..

echo "🔨 Building frontend..."
cd frontend
npm run build
cd ..

echo "📁 Copying frontend build to public folder..."
rm -rf public/*
cp -r frontend/dist/* public/

echo "✅ Build completed successfully!"
