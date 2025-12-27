@echo off
chcp 65001 >nul
cls
echo ========================================
echo   Остановка всех сервисов
echo ========================================
echo.

echo Остановка Node.js процессов...
taskkill /F /IM node.exe >nul 2>&1
if errorlevel 1 (
    echo Node.js процессы не найдены или уже остановлены.
) else (
    echo Node.js процессы остановлены.
)

timeout /t 1 /nobreak >nul

echo.
echo Остановка Cloudflare Tunnel...
taskkill /F /IM cloudflared.exe >nul 2>&1
if errorlevel 1 (
    echo Cloudflare Tunnel не найден или уже остановлен.
) else (
    echo Cloudflare Tunnel остановлен.
)

echo.
echo ========================================
echo   Все сервисы остановлены!
echo ========================================
echo.
pause

