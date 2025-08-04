@echo off
setlocal enabledelayedexpansion

:: Ask for target if not passed
if "%1"=="" (
    echo Usage: build.bat chrome ^| firefox
    exit /b 1
)

set TARGET=%1
set SOURCE_DIR=%~dp0
set COMMON_DIR=%SOURCE_DIR%common
set TARGET_DIR=%SOURCE_DIR%%TARGET%
set DIST_DIR=%SOURCE_DIR%dist\%TARGET%

:: Clean previous build
if exist "%DIST_DIR%" (
    rmdir /s /q "%DIST_DIR%"
)
mkdir "%DIST_DIR%"

:: Copy common files
xcopy /e /i /y "%COMMON_DIR%" "%DIST_DIR%"

:: Copy manifest
copy /y "%TARGET_DIR%" "%DIST_DIR%"

echo Build complete: %DIST_DIR%