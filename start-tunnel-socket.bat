@echo off
chcp 65001 >nul
cls
echo ========================================
echo   Cloudflare Tunnel для Socket.io
echo ========================================
echo.
echo Прокидываем порт 3001 (Socket.io сервер)...
echo.
echo После запуска скопируйте URL и используйте его
echo в настройках Socket.io сервера в приложении!
echo.
echo Для остановки нажмите Ctrl+C
echo.
echo ========================================
echo.

cloudflared tunnel --url http://localhost:3001

pause

