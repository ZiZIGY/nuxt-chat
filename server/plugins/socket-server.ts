import { startSocketIOServer } from '../utils/socket';

export default defineNitroPlugin(() => {
  // Запускаем Socket.io сервер при инициализации Nitro
  startSocketIOServer();
});

