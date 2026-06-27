@echo off
echo Building Angular...
call npm run build
if %ERRORLEVEL% neq 0 exit /b %ERRORLEVEL%

echo Copying files to Backend wwwroot...
robocopy docs\browser C:\backend\new\UCCD_App\wwwroot /E /IS /IT

if %ERRORLEVEL% GEQ 8 (
    echo Robocopy failed!
    exit /b %ERRORLEVEL%
)

echo Deployment to backend successful!
exit /b 0
