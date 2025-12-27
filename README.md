# P2P Chat Application

Приложение для P2P чата с использованием WebRTC и Socket.io для signaling.

## Важно: Настройка подключения между пользователями

Для того чтобы два пользователя могли подключиться друг к другу, **оба должны использовать один и тот же Socket.io сервер**.

### Вариант 1: Использование одного компьютера как сервера

1. **На компьютере, который будет сервером:**
   - Запустите приложение: `yarn dev`
   - В консоли вы увидите IP-адреса, по которым доступен сервер Socket.io (например: `http://192.168.1.100:3001`)
   - Найдите свой локальный IP-адрес в списке (не localhost и не 127.0.0.1)

2. **На втором компьютере:**
   - Откройте приложение
   - На главной странице в поле "Настройки сервера" введите IP-адрес сервера (например: `http://192.168.1.100:3001`)
   - Создайте комнату или подключитесь к существующей

3. **На компьютере-сервере:**
   - Также укажите свой IP-адрес в настройках сервера (или оставьте пустым, если используете localhost)

### Вариант 2: Использование отдельного Socket.io сервера

Если у вас есть отдельный сервер, запустите на нем Socket.io сервер:

```bash
yarn dev:socket
```

Или установите переменную окружения:
```bash
NUXT_PUBLIC_SOCKET_SERVER_URL=http://your-server.com:3001 yarn dev
```

### Проблемы с подключением

- **Проверьте файрвол:** Убедитесь, что порт 3001 открыт в файрволе на компьютере-сервере
- **Проверьте сеть:** Оба компьютера должны быть в одной сети (или сервер должен быть доступен из интернета)
- **Проверьте адрес:** Оба пользователя должны использовать одинаковый адрес Socket.io сервера
- **Проверьте консоль браузера:** Откройте DevTools (F12) и проверьте ошибки подключения

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
