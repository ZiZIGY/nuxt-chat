import { Server as SocketIOServer } from 'socket.io';
import { createServer } from 'http';

let io: SocketIOServer | null = null;
let httpServer: ReturnType<typeof createServer> | null = null;

export function startSocketIOServer() {
  if (io) {
    return io;
  }

  httpServer = createServer();

  io = new SocketIOServer(httpServer, {
    path: '/socket.io/',
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  io.on('connection', (socket) => {
    console.log('Новое подключение:', socket.id);

    const userRooms = new Map<string, string>();

    socket.on('join-room', (roomId: string, userId: string) => {
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

  return io;
}

export function getSocketIO() {
  return io;
}
