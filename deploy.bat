@echo off
REM 🚀 Frontend Deployment Script for Vercel (Windows)

echo 🔧 Preparing frontend for deployment...

REM Check if we're in the frontend directory
if not exist "package.json" (
    echo ❌ Error: Run this script from the frontend directory
    exit /b 1
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Check if .env.production exists
if not exist ".env.production" (
    echo ⚠️  Warning: .env.production not found. Creating template...
    echo REACT_APP_API_URL=https://your-backend-url.onrender.com/api > .env.production
    echo 📝 Please update .env.production with your production values
)

REM Test build
echo 🏗️  Testing production build...
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful!
) else (
    echo ❌ Build failed! Please fix errors before deploying.
    exit /b 1
)

REM Check build directory
echo 📁 Build directory created successfully
dir build

echo 🎉 Frontend is ready for deployment!
echo.
echo 📋 Next steps:
echo 1. Push your code to GitHub
echo 2. Connect repository to Vercel
echo 3. Set environment variables in Vercel dashboard
echo 4. Deploy!
echo.
echo 🔗 Environment variables to set in Vercel:
echo    REACT_APP_API_URL=^<your-render-backend-url^>/api

pause
