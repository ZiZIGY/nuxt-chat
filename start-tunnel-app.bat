@echo off
chcp 65001 >nul
cls
echo ========================================
echo   Cloudflare Tunnel для приложения
echo ========================================
echo.
echo Прокидываем порт 3000 (Nuxt приложение)...
echo.
echo После запуска скопируйте URL и используйте его
echo для доступа к приложению!
echo.
echo Для остановки нажмите Ctrl+C
echo.
echo ========================================
echo.

cloudflared tunnel --url http://localhost:3000

pause

