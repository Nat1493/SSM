@echo off
echo ============================================
echo SS Mudyf Accounting System Setup
echo ============================================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    echo Then run this setup script again.
    pause
    exit /b 1
)

echo Node.js is installed: 
node --version
echo.

REM Check if we're in the right directory
if not exist package.json (
    echo ERROR: package.json not found!
    echo Make sure you're running this script in the project folder
    echo that contains all the application files.
    pause
    exit /b 1
)

echo Installing dependencies...
npm install
if errorlevel 1 (
    echo.
    echo Installation failed! Trying alternative method...
    npm install --force
    if errorlevel 1 (
        echo ERROR: Failed to install dependencies!
        echo Please check your internet connection and try again.
        pause
        exit /b 1
    )
)

echo.
echo Creating assets folder...
if not exist assets mkdir assets

echo.
echo ============================================
echo Setup completed successfully!
echo ============================================
echo.
echo To start the application, run: npm start
echo.
echo Note: You can add your company logo to the 'assets' folder
echo as 'icon.png' to customize the application icon.
echo.
pause