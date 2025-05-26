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

powershell Compress-Archive -Path "%DIST_DIR%\*" -DestinationPath "%SOURCE_DIR%%TARGET%.zip" -Force