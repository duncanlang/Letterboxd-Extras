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

:: Full path to output zip file
set ZIP_FILE=%SOURCE_DIR%%TARGET%.zip

:: Delete old zip if it exists
if exist "%ZIP_FILE%" del "%ZIP_FILE%"

:: Create zip using 7-Zip
"C:\Program Files\7-Zip\7z.exe" a -tzip "%ZIP_FILE%" "%DIST_DIR%\*"

:: Check for success
if errorlevel 1 (
    echo Failed to create archive with 7-Zip.
    exit /b 1
) else (
    echo Archive created successfully: %ZIP_FILE%
)
