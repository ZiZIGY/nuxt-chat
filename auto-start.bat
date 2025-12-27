@echo off
chcp 65001 >nul
cls
echo ========================================
echo   Автоматический запуск P2P Chat
echo ========================================
echo.

REM Проверка зависимостей
echo [1/6] Проверка зависимостей...
if not exist "node_modules" (
    echo Установка зависимостей...
    call yarn install
    if errorlevel 1 (
        echo ОШИБКА: Не удалось установить зависимости!
        pause
        exit /b 1
    )
) else (
    echo Зависимости уже установлены.
)

REM Проверка cloudflared
echo.
echo [2/6] Проверка cloudflared...
where cloudflared >nul 2>&1
if errorlevel 1 (
    echo ОШИБКА: cloudflared не найден!
    echo.
    echo Установите cloudflared:
    echo 1. Скачайте: https://github.com/cloudflare/cloudflared/releases/latest
    echo 2. Положите cloudflared.exe в C:\cloudflared\
    echo 3. Или добавьте в PATH
    echo.
    pause
    exit /b 1
) else (
    echo cloudflared найден.
    cloudflared --version
)

REM Остановка старых процессов
echo.
echo [3/6] Остановка старых процессов...
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Nuxt App*" >nul 2>&1
taskkill /F /IM node.exe /FI "WINDOWTITLE eq Socket Server*" >nul 2>&1
taskkill /F /IM cloudflared.exe >nul 2>&1
timeout /t 2 /nobreak >nul

REM Запуск Nuxt приложения (Socket.io сервер запустится автоматически)
echo.
echo [4/6] Запуск Nuxt приложения (порты 3000 и 3001)...
echo    - Порт 3000: Nuxt приложение
echo    - Порт 3001: Socket.io сервер (запускается автоматически)
start "Nuxt App" cmd /k "title Nuxt App - Порты 3000 и 3001 && yarn dev"
timeout /t 8 /nobreak >nul

REM Socket.io сервер запускается автоматически вместе с Nuxt приложением
echo.
echo [5/6] Socket.io сервер запускается автоматически с Nuxt (порт 3001)...
timeout /t 2 /nobreak >nul

REM Запуск туннелей
echo.
echo [6/6] Запуск Cloudflare Tunnel...
echo.
echo Запускаю туннели для приложения и Socket.io...
start "Cloudflare Tunnel - App" cmd /k "title Cloudflare Tunnel - App (порт 3000) && cloudflared tunnel --url http://localhost:3000"
timeout /t 2 /nobreak >nul
start "Cloudflare Tunnel - Socket" cmd /k "title Cloudflare Tunnel - Socket (порт 3001) && cloudflared tunnel --url http://localhost:3001"

echo.
echo ========================================
echo   Все сервисы запущены!
echo ========================================
echo.
echo Откройте окна Cloudflare Tunnel и скопируйте URL:
echo.
echo   1. URL приложения (из окна "Cloudflare Tunnel - App")
echo   2. URL Socket.io (из окна "Cloudflare Tunnel - Socket")
echo.
echo Затем:
echo   1. Откройте URL приложения в браузере
echo   2. В настройках Socket.io введите URL Socket.io
echo   3. Создайте комнату
echo.
echo Для остановки закройте все окна или нажмите Ctrl+C
echo.
pause

