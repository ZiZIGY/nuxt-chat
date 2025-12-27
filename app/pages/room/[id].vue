<script setup lang="ts">
  import { onMounted, onUnmounted, ref } from 'vue';
  import { Button } from '@/components/ui/button';
  import { useWebRTCChat } from '@/composables/useWebRTCChat';
  import { useSocket } from '@/composables/useSocket';

  const route = useRoute();
  const roomId = route.params.id as string;

  const {
    isConnected,
    connectionError,
    messages,
    setup,
    sendMessage,
    cleanup,
  } = useWebRTCChat(roomId);

  const { getServerUrl, setServerUrl } = useSocket();
  const messageInput = ref('');
  const copySuccess = ref(false);
  const serverUrlInput = ref('');
  const showServerSettings = ref(false);

  onMounted(() => {
    const savedUrl = getServerUrl();
    serverUrlInput.value = savedUrl;
    setup();
  });

  onUnmounted(() => {
    cleanup();
  });

  function handleSendMessage() {
    if (messageInput.value.trim()) {
      sendMessage(messageInput.value.trim());
      messageInput.value = '';
    }
  }

  function handleLeave() {
    cleanup();
    navigateTo('/');
  }

  async function copyRoomId() {
    if (roomId) {
      try {
        await navigator.clipboard.writeText(roomId);
        copySuccess.value = true;
        setTimeout(() => {
          copySuccess.value = false;
        }, 2000);
      } catch (error) {
        console.error('Ошибка копирования:', error);
      }
    }
  }

  function updateServerUrl() {
    if (serverUrlInput.value.trim()) {
      setServerUrl(serverUrlInput.value.trim());
      // Переподключаемся с новым адресом
      cleanup();
      setTimeout(() => {
        setup();
      }, 500);
    }
  }
</script>

<template>
  <div class="container mx-auto px-4 py-6 max-w-4xl">
    <div class="mb-4 flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold">Комната: {{ roomId }}</h1>
        <p class="text-sm text-muted-foreground">
          Статус: {{ isConnected ? 'Подключено' : 'Подключение...' }}
        </p>
        <p
          v-if="connectionError"
          class="text-sm text-destructive mt-1"
        >
          {{ connectionError }}
        </p>
        <p class="text-xs text-muted-foreground mt-1">
          Сервер: {{ getServerUrl() }}
        </p>
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          @click="showServerSettings = !showServerSettings"
        >
          {{ showServerSettings ? 'Скрыть' : 'Настройки сервера' }}
        </Button>
        <Button
          variant="outline"
          @click="handleLeave"
        >
          Покинуть комнату
        </Button>
      </div>
    </div>

    <!-- Настройки сервера -->
    <div
      v-if="showServerSettings"
      class="mb-4 p-4 bg-muted rounded-lg"
    >
      <h3 class="text-sm font-semibold mb-2">Настройки Socket.io сервера</h3>
      <p class="text-xs text-muted-foreground mb-2">
        Укажите адрес сервера Socket.io. Оба пользователя должны использовать один и тот же адрес!
      </p>
      <div class="flex gap-2">
        <input
          v-model="serverUrlInput"
          type="text"
          placeholder="http://localhost:3001"
          class="flex-1 px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          @keyup.enter="updateServerUrl"
        />
        <Button
          size="sm"
          @click="updateServerUrl"
        >
          Применить
        </Button>
      </div>
    </div>

    <!-- Информация об ожидании подключения -->
    <div
      v-if="!isConnected"
      class="mb-4 p-4 bg-muted rounded-lg"
    >
      <p class="text-sm mb-3">
        <strong>Ожидание подключения...</strong>
      </p>
      <div class="flex items-center gap-2 flex-wrap">
        <div class="flex-1 min-w-[200px]">
          <p class="text-xs text-muted-foreground mb-1">
            ID комнаты (скопируйте и отправьте другу):
          </p>
          <div
            class="flex items-center gap-2 bg-background px-3 py-2 rounded border"
          >
            <code class="text-sm flex-1 break-all">{{ roomId }}</code>
            <Button
              size="sm"
              variant="outline"
              @click="copyRoomId"
            >
              {{ copySuccess ? 'Скопировано!' : 'Копировать' }}
            </Button>
          </div>
        </div>
      </div>
      <p class="text-xs text-muted-foreground mt-2">
        Другой пользователь должен ввести этот ID в поле "Подключиться к
        комнате" на главной странице.
      </p>
      <p class="text-xs text-muted-foreground mt-2">
        <strong>Для тестирования:</strong> Откройте эту же страницу в другой
        вкладке браузера с тем же ID комнаты.
      </p>
    </div>

    <!-- Чат -->
    <div class="bg-card border rounded-lg p-6 flex flex-col h-[600px]">
      <h2 class="text-lg font-semibold mb-4">Чат</h2>

      <div class="flex-1 overflow-y-auto mb-4 space-y-2">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'p-3 rounded-lg max-w-[80%]',
            message.sender === 'local'
              ? 'bg-primary text-primary-foreground ml-auto'
              : 'bg-muted mr-auto',
          ]"
        >
          <p class="text-sm">{{ message.text }}</p>
          <p class="text-xs opacity-70 mt-1">
            {{ message.timestamp.toLocaleTimeString() }}
          </p>
        </div>
        <div
          v-if="messages.length === 0"
          class="text-center text-muted-foreground py-8"
        >
          <p>Нет сообщений. Начните общение!</p>
        </div>
      </div>

      <div class="flex gap-2">
        <input
          v-model="messageInput"
          type="text"
          placeholder="Введите сообщение..."
          class="flex-1 px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          :disabled="!isConnected"
          @keyup.enter="handleSendMessage"
        />
        <Button
          :disabled="!isConnected || !messageInput.trim()"
          @click="handleSendMessage"
        >
          Отправить
        </Button>
      </div>
    </div>
  </div>
</template>
