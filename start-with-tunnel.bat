@echo off
chcp 65001 >nul
cls
echo ========================================
echo   Запуск P2P Chat с Cloudflare Tunnel
echo ========================================
echo.
echo Этот скрипт запустит:
echo   1. Nuxt приложение (порт 3000)
echo   2. Socket.io сервер (порт 3001)
echo   3. Cloudflare Tunnel для обоих портов
echo.
echo Убедитесь, что cloudflared установлен!
echo.
pause

echo.
echo [1/3] Запуск Nuxt приложения...
start "Nuxt App" cmd /k "yarn dev"

timeout /t 3 /nobreak >nul

REM Socket.io сервер запускается автоматически вместе с Nuxt
echo.
echo [2/3] Socket.io сервер запускается автоматически с Nuxt (порт 3001)...
timeout /t 2 /nobreak >nul

echo.
echo [3/4] Запуск Cloudflare Tunnel для приложения...
start "Cloudflare Tunnel - App" cmd /k "cloudflared tunnel --url http://localhost:3000"

timeout /t 3 /nobreak >nul

echo.
echo [4/4] Запуск Cloudflare Tunnel для Socket.io...
start "Cloudflare Tunnel - Socket" cmd /k "cloudflared tunnel --url http://localhost:3001"

echo.
echo ========================================
echo   Все сервисы запущены!
echo ========================================
echo.
echo ВАЖНО: Откройте оба окна Cloudflare Tunnel и скопируйте URL:
echo.
echo   1. URL для приложения (из окна "Cloudflare Tunnel - App")
echo      Используйте его для доступа к приложению в браузере
echo.
echo   2. URL для Socket.io (из окна "Cloudflare Tunnel - Socket")
echo      Используйте его в настройках Socket.io сервера в приложении
echo.
echo Инструкция:
echo   1. Откройте URL приложения в браузере
echo   2. На главной странице в поле "Настройки сервера" введите URL Socket.io
echo   3. Создайте комнату или подключитесь к существующей
echo   4. Отправьте URL приложения другу
echo.
pause

