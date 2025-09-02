@echo off
setlocal enabledelayedexpansion

REM ==============================================
REM SS Mudyf Order Tracking System - Build Script
REM ==============================================

echo.
echo ============================================
echo SS Mudyf Order Tracking System - Builder
echo ============================================
echo Version: 1.0.0
echo Company: SS Mudyf Textile Factory, Eswatini
echo ============================================
echo.

REM Set colors for better visibility
set "RED=[91m"
set "GREEN=[92m"
set "YELLOW=[93m"
set "BLUE=[94m"
set "MAGENTA=[95m"
set "CYAN=[96m"
set "WHITE=[97m"
set "RESET=[0m"

REM Check if Node.js is installed
echo %CYAN%Checking system requirements...%RESET%
node --version >nul 2>&1
if errorlevel 1 (
    echo %RED%ERROR: Node.js is not installed!%RESET%
    echo %YELLOW%Please install Node.js from https://nodejs.org/%RESET%
    echo %YELLOW%Minimum required version: Node.js 16.x or higher%RESET%
    echo.
    echo Press any key to open Node.js download page...
    pause >nul
    start https://nodejs.org/
    goto :end
)

REM Display Node.js version
for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo %GREEN%✓ Node.js is installed: %NODE_VERSION%%RESET%

REM Check npm version
for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo %GREEN%✓ npm is installed: v%NPM_VERSION%%RESET%

REM Check if we're in the right directory
if not exist package.json (
    echo %RED%ERROR: package.json not found!%RESET%
    echo %YELLOW%Make sure you're running this script in the project folder%RESET%
    echo %YELLOW%that contains all the SS Mudyf application files.%RESET%
    echo.
    pause
    goto :end
)

echo %GREEN%✓ Project files found%RESET%
echo.

REM Show build options menu
:menu
echo %MAGENTA%============================================%RESET%
echo %MAGENTA%        Build Options Menu%RESET%
echo %MAGENTA%============================================%RESET%
echo.
echo %WHITE%1.%RESET% %CYAN%Quick Build (Windows only)%RESET%
echo %WHITE%2.%RESET% %CYAN%Full Build (All platforms)%RESET%
echo %WHITE%3.%RESET% %CYAN%Development Build%RESET%
echo %WHITE%4.%RESET% %CYAN%Web Version Only%RESET%
echo %WHITE%5.%RESET% %CYAN%Clean Build (Fresh start)%RESET%
echo %WHITE%6.%RESET% %CYAN%Install Dependencies Only%RESET%
echo %WHITE%7.%RESET% %CYAN%Exit%RESET%
echo.
set /p choice=%YELLOW%Enter your choice (1-7): %RESET%

if "%choice%"=="1" goto :quick_build
if "%choice%"=="2" goto :full_build
if "%choice%"=="3" goto :dev_build
if "%choice%"=="4" goto :web_build
if "%choice%"=="5" goto :clean_build
if "%choice%"=="6" goto :install_deps
if "%choice%"=="7" goto :end

echo %RED%Invalid choice. Please select 1-7.%RESET%
echo.
goto :menu

:quick_build
echo.
echo %CYAN%============================================%RESET%
echo %CYAN%        Quick Build (Windows)%RESET%
echo %CYAN%============================================%RESET%
echo.
goto :check_deps

:full_build
echo.
echo %CYAN%============================================%RESET%
echo %CYAN%        Full Build (All Platforms)%RESET%
echo %CYAN%============================================%RESET%
echo.
goto :check_deps

:dev_build
echo.
echo %CYAN%============================================%RESET%
echo %CYAN%        Development Build%RESET%
echo %CYAN%============================================%RESET%
echo.
goto :check_deps

:web_build
echo.
echo %CYAN%============================================%RESET%
echo %CYAN%        Web Version Build%RESET%
echo %CYAN%============================================%RESET%
echo.
goto :check_deps

:clean_build
echo.
echo %CYAN%============================================%RESET%
echo %CYAN%        Clean Build (Fresh Start)%RESET%
echo %CYAN%============================================%RESET%
echo.
echo %YELLOW%Cleaning previous builds and dependencies...%RESET%
if exist node_modules (
    echo %YELLOW%Removing node_modules...%RESET%
    rmdir /s /q node_modules 2>nul
)
if exist build (
    echo %YELLOW%Removing build folder...%RESET%
    rmdir /s /q build 2>nul
)
if exist dist (
    echo %YELLOW%Removing dist folder...%RESET%
    rmdir /s /q dist 2>nul
)
echo %GREEN%✓ Clean completed%RESET%
echo.
goto :check_deps

:install_deps
echo.
echo %CYAN%============================================%RESET%
echo %CYAN%        Installing Dependencies%RESET%
echo %CYAN%============================================%RESET%
echo.
goto :install_dependencies

:check_deps
REM Check if node_modules exists
if not exist node_modules (
    echo %YELLOW%Dependencies not found. Installing...%RESET%
    goto :install_dependencies
) else (
    echo %GREEN%✓ Dependencies found%RESET%
    goto :start_build
)

:install_dependencies
echo %BLUE%Installing project dependencies...%RESET%
echo %YELLOW%This may take a few minutes...%RESET%
echo.

npm install
if errorlevel 1 (
    echo.
    echo %YELLOW%Installation failed! Trying alternative method...%RESET%
    npm install --legacy-peer-deps
    if errorlevel 1 (
        echo.
        echo %RED%ERROR: Failed to install dependencies!%RESET%
        echo %YELLOW%Possible solutions:%RESET%
        echo %YELLOW%1. Check your internet connection%RESET%
        echo %YELLOW%2. Clear npm cache: npm cache clean --force%RESET%
        echo %YELLOW%3. Try deleting node_modules and package-lock.json%RESET%
        echo.
        pause
        goto :end
    )
)

echo.
echo %GREEN%✓ Dependencies installed successfully%RESET%
echo.

if "%choice%"=="6" (
    echo %GREEN%Dependencies installation completed!%RESET%
    echo.
    pause
    goto :menu
)

:start_build
REM Create necessary directories
if not exist assets mkdir assets
if not exist dist mkdir dist

echo %BLUE%Preparing build environment...%RESET%

REM Check for Tailwind CSS
if not exist tailwind.config.js (
    echo %YELLOW%Initializing Tailwind CSS...%RESET%
    npx tailwindcss init -p 2>nul
)

echo %GREEN%✓ Build environment ready%RESET%
echo.

REM Execute build based on choice
if "%choice%"=="1" goto :execute_quick
if "%choice%"=="2" goto :execute_full
if "%choice%"=="3" goto :execute_dev
if "%choice%"=="4" goto :execute_web
if "%choice%"=="5" goto :execute_quick

:execute_quick
echo %BLUE%Building React application...%RESET%
npm run build
if errorlevel 1 (
    echo %RED%ERROR: React build failed!%RESET%
    goto :build_error
)
echo %GREEN%✓ React build completed%RESET%

echo.
echo %BLUE%Building Electron application for Windows...%RESET%
npm run build-win
if errorlevel 1 (
    echo %RED%ERROR: Electron build failed!%RESET%
    goto :build_error
)
echo %GREEN%✓ Windows build completed%RESET%
goto :build_success

:execute_full
echo %BLUE%Building React application...%RESET%
npm run build
if errorlevel 1 (
    echo %RED%ERROR: React build failed!%RESET%
    goto :build_error
)
echo %GREEN%✓ React build completed%RESET%

echo.
echo %BLUE%Building Electron application for all platforms...%RESET%
echo %YELLOW%This will take several minutes...%RESET%
npm run build-all
if errorlevel 1 (
    echo %RED%ERROR: Multi-platform build failed!%RESET%
    goto :build_error
)
echo %GREEN%✓ Multi-platform build completed%RESET%
goto :build_success

:execute_dev
echo %BLUE%Building development version...%RESET%
npm run build
if errorlevel 1 (
    echo %RED%ERROR: Development build failed!%RESET%
    goto :build_error
)
echo %GREEN%✓ Development build completed%RESET%

echo.
echo %BLUE%Building Electron development package...%RESET%
npm run electron-build
if errorlevel 1 (
    echo %RED%ERROR: Electron development build failed!%RESET%
    goto :build_error
)
echo %GREEN%✓ Development package completed%RESET%
goto :build_success

:execute_web
echo %BLUE%Building web version only...%RESET%
npm run build
if errorlevel 1 (
    echo %RED%ERROR: Web build failed!%RESET%
    goto :build_error
)
echo %GREEN%✓ Web version build completed%RESET%
goto :web_success

:build_error
echo.
echo %RED%============================================%RESET%
echo %RED%              BUILD FAILED%RESET%
echo %RED%============================================%RESET%
echo.
echo %YELLOW%Troubleshooting steps:%RESET%
echo %YELLOW%1. Check the error messages above%RESET%
echo %YELLOW%2. Ensure all required dependencies are installed%RESET%
echo %YELLOW%3. Try running 'npm run clean' and rebuild%RESET%
echo %YELLOW%4. Check available disk space%RESET%
echo %YELLOW%5. Restart the command prompt as Administrator%RESET%
echo.
echo %YELLOW%For support, contact the SS Mudyf development team%RESET%
echo.
pause
goto :menu

:web_success
echo.
echo %GREEN%============================================%RESET%
echo %GREEN%          WEB BUILD SUCCESSFUL%RESET%
echo %GREEN%============================================%RESET%
echo.
echo %CYAN%Web version has been built successfully!%RESET%
echo.
echo %WHITE%Build location:%RESET% %YELLOW%build/%RESET%
echo %WHITE%To serve locally:%RESET% %YELLOW%npx serve -s build%RESET%
echo %WHITE%Port:%RESET% %YELLOW%http://localhost:3000%RESET%
echo.
goto :build_complete

:build_success
echo.
echo %GREEN%============================================%RESET%
echo %GREEN%          BUILD SUCCESSFUL%RESET%
echo %GREEN%============================================%RESET%
echo.
echo %CYAN%SS Mudyf Order Tracking System has been built successfully!%RESET%
echo.

REM Show build results
echo %WHITE%Build Results:%RESET%
echo %YELLOW%─────────────────────────────────────────%RESET%

if exist dist (
    echo %GREEN%✓ Distribution files created in 'dist' folder%RESET%
    
    REM List built files
    for %%f in (dist\*.exe) do (
        echo %CYAN%  → Windows Installer: %%~nxf%RESET%
    )
    for %%f in (dist\*.dmg) do (
        echo %CYAN%  → macOS Package: %%~nxf%RESET%
    )
    for %%f in (dist\*.AppImage) do (
        echo %CYAN%  → Linux Package: %%~nxf%RESET%
    )
    
    REM Get file sizes
    echo.
    echo %WHITE%Package Sizes:%RESET%
    for %%f in (dist\*.*) do (
        set "size=%%~zf"
        set /a "size_mb=!size!/1024/1024"
        echo %YELLOW%  %%~nxf: !size_mb! MB%RESET%
    )
)

if exist build (
    echo %GREEN%✓ Web assets created in 'build' folder%RESET%
)

echo.

:build_complete
echo %WHITE%Installation Instructions:%RESET%
echo %YELLOW%─────────────────────────────────────────%RESET%
echo %CYAN%Windows:%RESET% Run the .exe installer from the dist folder
echo %CYAN%macOS:%RESET% Mount the .dmg file and drag to Applications
echo %CYAN%Linux:%RESET% Make the .AppImage executable and run
echo.

echo %WHITE%Next Steps:%RESET%
echo %YELLOW%─────────────────────────────────────────%RESET%
echo %CYAN%1.%RESET% Test the built application
echo %CYAN%2.%RESET% Distribute to SS Mudyf team members
echo %CYAN%3.%RESET% Deploy to production environment
echo %CYAN%4.%RESET% Create user documentation
echo.

REM Ask if user wants to open the dist folder
set /p open_folder=%YELLOW%Would you like to open the distribution folder? (y/n): %RESET%
if /i "%open_folder%"=="y" (
    if exist dist (
        echo %GREEN%Opening dist folder...%RESET%
        explorer dist
    ) else if exist build (
        echo %GREEN%Opening build folder...%RESET%
        explorer build
    )
)

echo.
echo %MAGENTA%Thank you for using SS Mudyf Build System!%RESET%
echo %CYAN%For support: Contact SS Mudyf Development Team%RESET%
echo.

REM Ask if user wants to build again
set /p build_again=%YELLOW%Would you like to build another version? (y/n): %RESET%
if /i "%build_again%"=="y" (
    echo.
    goto :menu
)

goto :end

:end
echo.
echo %WHITE%Build session ended.%RESET%
echo %CYAN%SS Mudyf Order Tracking System Builder%RESET%
echo.
pause
exit /b 0