import { ref, type Ref, onUnmounted } from 'vue';
import Peer, { type DataConnection, type PeerJSOption } from 'peerjs';
import { useSocket } from './useSocket';

export interface Message {
  id: string;
  text: string;
  sender: 'local' | 'remote';
  timestamp: Date;
}

export function useWebRTCChat(roomId: string) {
  const isConnected = ref(false);
  const connectionError = ref<string | null>(null);
  const messages = ref<Message[]>([]);
  const peer: Ref<Peer | null> = ref(null);
  const dataConnection: Ref<DataConnection | null> = ref(null);
  const myPeerId = ref<string | null>(null);

  const peerConfig: PeerJSOption = {
    config: {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    },
  };

  // Используем Socket.io для signaling
  const {
    socket,
    connect: connectSocket,
    disconnect: disconnectSocket,
    joinRoom,
    onUserConnected,
    onUserDisconnected,
  } = useSocket();

  function addMessage(text: string, sender: 'local' | 'remote') {
    messages.value.push({
      id: crypto.randomUUID(),
      text,
      sender,
      timestamp: new Date(),
    });
  }

  function initializePeer() {
    if (peer.value) {
      peer.value.destroy();
    }

    // Все пользователи создают Peer с автоматическим ID
    const newPeer = new Peer(peerConfig);
    peer.value = newPeer;

    newPeer.on('open', (id) => {
      console.log('Peer открыт с ID:', id);
      myPeerId.value = id;

      // Подключаемся к Socket.io и присоединяемся к комнате
      if (!socket.value) {
        connectSocket();
      }

      // Ждем подключения Socket.io перед присоединением к комнате
      if (socket.value?.connected) {
        joinRoom(roomId, id);
      } else {
        socket.value?.once('connect', () => {
          joinRoom(roomId, id);
        });
      }
    });

    newPeer.on('error', (err) => {
      console.error('Peer ошибка:', err);

      if (err.type === 'unavailable-id' || err.type === 'socket-error') {
        connectionError.value =
          'Ошибка подключения. Попробуйте обновить страницу.';
      } else if (err.type === 'network' || err.type === 'server-error') {
        connectionError.value = 'Ошибка сети. Проверьте подключение.';
      } else if (err.type !== 'webrtc') {
        connectionError.value = `Ошибка: ${err.message}`;
      }
    });

    // Обработка входящих подключений
    newPeer.on('connection', (conn) => {
      console.log('Входящее подключение от:', conn.peer);
      setupDataConnection(conn);
    });
  }

  function connectToPeer(peerId: string) {
    if (!peer.value) {
      console.error('Peer не инициализирован');
      return;
    }

    // Не подключаемся к себе
    if (peerId === myPeerId.value) {
      return;
    }

    console.log('Подключение к peer:', peerId);

    try {
      const conn = peer.value.connect(peerId, {
        reliable: true,
      });

      setupDataConnection(conn);
    } catch (error) {
      console.error('Ошибка подключения к peer:', error);
      connectionError.value = 'Не удалось подключиться к пользователю';
    }
  }

  function setupDataConnection(conn: DataConnection) {
    // Закрываем предыдущее соединение если есть
    if (dataConnection.value) {
      dataConnection.value.close();
    }

    dataConnection.value = conn;

    conn.on('open', () => {
      console.log('Data connection открыт');
      isConnected.value = true;
      connectionError.value = null;
    });

    conn.on('data', (data) => {
      try {
        const message = data as { type: string; text: string };
        if (message.type === 'message' && message.text) {
          addMessage(message.text, 'remote');
        }
      } catch (error) {
        console.error('Ошибка парсинга сообщения:', error);
      }
    });

    conn.on('close', () => {
      console.log('Data connection закрыт');
      isConnected.value = false;
    });

    conn.on('error', (err) => {
      console.error('Data connection ошибка:', err);
      connectionError.value = 'Ошибка передачи данных';
      isConnected.value = false;
    });
  }

  function sendMessage(text: string) {
    if (dataConnection.value && dataConnection.value.open) {
      try {
        dataConnection.value.send({
          type: 'message',
          text,
        });
        addMessage(text, 'local');
      } catch (error) {
        console.error('Ошибка отправки сообщения:', error);
        connectionError.value = 'Ошибка отправки сообщения';
      }
    }
  }

  function setup() {
    // Подключаемся к Socket.io
    connectSocket();

    // Инициализируем Peer
    initializePeer();

    // Слушаем события подключения пользователей через Socket.io
    const handleUserConnected = (userId: string) => {
      console.log('Новый пользователь подключился:', userId);
      // Подключаемся к новому пользователю через Peer.js
      if (myPeerId.value && userId !== myPeerId.value) {
        connectToPeer(userId);
      }
    };

    const handleUserDisconnected = (userId: string) => {
      console.log('Пользователь отключился:', userId);
      // Закрываем соединение если оно было с этим пользователем
      if (dataConnection.value) {
        dataConnection.value.close();
        dataConnection.value = null;
        isConnected.value = false;
      }
    };

    // Подписываемся на события после подключения Socket.io
    if (socket.value?.connected) {
      onUserConnected(handleUserConnected);
      onUserDisconnected(handleUserDisconnected);
    } else {
      socket.value?.once('connect', () => {
        onUserConnected(handleUserConnected);
        onUserDisconnected(handleUserDisconnected);
      });
    }
  }

  function cleanup() {
    if (dataConnection.value) {
      dataConnection.value.close();
      dataConnection.value = null;
    }
    if (peer.value) {
      peer.value.destroy();
      peer.value = null;
    }
    disconnectSocket();
    isConnected.value = false;
    connectionError.value = null;
    myPeerId.value = null;
  }

  onUnmounted(() => {
    cleanup();
  });

  return {
    isConnected,
    connectionError,
    messages,
    myPeerId,
    setup,
    sendMessage,
    cleanup,
  };
}
