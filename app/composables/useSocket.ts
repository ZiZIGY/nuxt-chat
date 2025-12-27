import { ref, type Ref, onUnmounted } from 'vue';
import { io, type Socket } from 'socket.io-client';

export function useSocket() {
  const socket: Ref<Socket | null> = ref(null);
  const isConnected = ref(false);

  function connect() {
    // Подключаемся к Socket.io серверу на порту 3001
    // В dev режиме используем localhost:3001
    // В продакшене используем тот же хост но порт 3001
    const isDev =
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1';
    const serverUrl = isDev
      ? 'http://localhost:3001'
      : `${window.location.protocol}//${window.location.hostname}:3001`;

    socket.value = io(serverUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
    });

    socket.value.on('connect', () => {
      console.log('Socket.io подключен:', socket.value?.id);
      isConnected.value = true;
    });

    socket.value.on('disconnect', () => {
      console.log('Socket.io отключен');
      isConnected.value = false;
    });

    socket.value.on('connect_error', (error) => {
      console.error('Socket.io ошибка подключения:', error);
      isConnected.value = false;
    });
  }

  function disconnect() {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  }

  function joinRoom(roomId: string, userId: string) {
    if (socket.value) {
      socket.value.emit('join-room', roomId, userId);
    }
  }

  function onUserConnected(callback: (userId: string) => void) {
    if (socket.value) {
      socket.value.on('user-connected', callback);
    }
  }

  function onUserDisconnected(callback: (userId: string) => void) {
    if (socket.value) {
      socket.value.on('user-disconnected', callback);
    }
  }

  function offUserConnected(callback: (userId: string) => void) {
    if (socket.value) {
      socket.value.off('user-connected', callback);
    }
  }

  function offUserDisconnected(callback: (userId: string) => void) {
    if (socket.value) {
      socket.value.off('user-disconnected', callback);
    }
  }

  onUnmounted(() => {
    disconnect();
  });

  return {
    socket,
    isConnected,
    connect,
    disconnect,
    joinRoom,
    onUserConnected,
    onUserDisconnected,
    offUserConnected,
    offUserDisconnected,
  };
}
