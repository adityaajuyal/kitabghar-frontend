#!/bin/bash

# 🚀 Frontend Deployment Script for Vercel

echo "🔧 Preparing frontend for deployment..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Run this script from the frontend directory"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "⚠️  Warning: .env.production not found. Creating template..."
    echo "REACT_APP_API_URL=https://your-backend-url.onrender.com/api" > .env.production
    echo "📝 Please update .env.production with your production values"
fi

# Test build
echo "🏗️  Testing production build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

# Check build size
echo "📊 Build size analysis..."
du -sh build/
echo "📁 Build directory contains:"
ls -la build/

# Cleanup build directory (optional)
read -p "🗑️  Remove build directory? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    rm -rf build/
    echo "🗑️  Build directory removed"
fi

echo "🎉 Frontend is ready for deployment!"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect repository to Vercel"
echo "3. Set environment variables in Vercel dashboard"
echo "4. Deploy!"
echo ""
echo "🔗 Environment variables to set in Vercel:"
echo "   REACT_APP_API_URL=<your-render-backend-url>/api"
