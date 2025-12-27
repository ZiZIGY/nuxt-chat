import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

const httpServer = createServer();

const io = new SocketIOServer(httpServer, {
  path: '/socket.io/',
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

io.on('connection', (socket) => {
  console.log('Новое подключение:', socket.id);

  const userRooms = new Map();

  socket.on('join-room', (roomId, userId) => {
    console.log(`Пользователь ${userId} присоединился к комнате ${roomId}`);
    socket.join(roomId);
    userRooms.set(roomId, userId);

    socket.to(roomId).emit('user-connected', userId);
  });

  socket.on('disconnect', () => {
    console.log('Отключение:', socket.id);

    userRooms.forEach((userId, roomId) => {
      console.log(`Пользователь ${userId} отключился от комнаты ${roomId}`);
      socket.to(roomId).emit('user-disconnected', userId);
    });
    userRooms.clear();
  });
});

import { networkInterfaces } from 'os';

const PORT = process.env.SOCKET_PORT || 3001;
const HOST = process.env.SOCKET_HOST || '0.0.0.0';

httpServer.listen(PORT, HOST, () => {
  console.log(`✅ Socket.io server running on ${HOST}:${PORT}`);
  console.log(`📡 Доступен по адресам:`);
  console.log(`   - http://localhost:${PORT}`);
  console.log(`   - http://127.0.0.1:${PORT}`);
  
  // Получаем локальные IP-адреса
  const interfaces = networkInterfaces();
  Object.keys(interfaces).forEach((interfaceName) => {
    interfaces[interfaceName].forEach((iface) => {
      if (iface.family === 'IPv4' && !iface.internal) {
        console.log(`   - http://${iface.address}:${PORT}`);
      }
    });
  });
});
