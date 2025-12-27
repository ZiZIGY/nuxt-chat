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

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`✅ Socket.io server running on port ${PORT}`);
});
