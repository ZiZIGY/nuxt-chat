<script setup lang="ts">
  import { Button } from '@/components/ui/button';
  import { useSocket } from '@/composables/useSocket';

  const roomIdInput = ref('');
  const serverUrlInput = ref('');
  const { setServerUrl, getServerUrl } = useSocket();

  // Загружаем сохраненный адрес сервера при монтировании
  onMounted(() => {
    const savedUrl = getServerUrl();
    if (savedUrl && savedUrl !== 'http://localhost:3001') {
      serverUrlInput.value = savedUrl;
    } else {
      // По умолчанию показываем подсказку
      serverUrlInput.value = '';
    }
  });

  function createRoom() {
    // Сохраняем адрес сервера если указан
    if (serverUrlInput.value.trim()) {
      setServerUrl(serverUrlInput.value.trim());
    }
    // Генерируем случайный ID комнаты
    const newRoomId = crypto.randomUUID();
    navigateTo(`/room/${newRoomId}`);
  }

  function joinRoom() {
    // Сохраняем адрес сервера если указан
    if (serverUrlInput.value.trim()) {
      setServerUrl(serverUrlInput.value.trim());
    }
    if (roomIdInput.value.trim()) {
      navigateTo(`/room/${roomIdInput.value.trim()}`);
    }
  }
</script>

<template>
  <div class="container mx-auto px-4 py-16 max-w-2xl">
    <div class="text-center mb-12">
      <h1 class="text-4xl font-bold mb-4">P2P Chat</h1>
      <p class="text-muted-foreground"
        >Создайте комнату или подключитесь к существующей</p
      >
    </div>

    <div class="space-y-6">
      <!-- Настройка сервера Socket.io -->
      <div class="bg-card border rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Настройки сервера</h2>
        <p class="text-sm text-muted-foreground mb-4">
          Укажите адрес Socket.io сервера (например: http://192.168.1.100:3001 или http://example.com:3001).
          <br />
          <strong>Важно:</strong> Оба пользователя должны подключаться к одному и тому же серверу!
        </p>
        <div class="flex gap-2">
          <input
            v-model="serverUrlInput"
            type="text"
            placeholder="http://localhost:3001 (по умолчанию)"
            class="flex-1 px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <p class="text-xs text-muted-foreground mt-2">
          Оставьте пустым для использования локального сервера (localhost:3001)
        </p>
      </div>

      <div class="bg-card border rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Создать комнату</h2>
        <p class="text-sm text-muted-foreground mb-4">
          Создайте новую комнату для чата
        </p>
        <Button
          class="w-full"
          size="lg"
          @click="createRoom"
        >
          Создать новую комнату
        </Button>
      </div>

      <div class="bg-card border rounded-lg p-6">
        <h2 class="text-xl font-semibold mb-4">Подключиться к комнате</h2>
        <p class="text-sm text-muted-foreground mb-4">
          Введите ID комнаты для подключения
        </p>
        <div class="flex gap-2">
          <input
            v-model="roomIdInput"
            type="text"
            placeholder="Введите ID комнаты"
            class="flex-1 px-4 py-2 border rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-primary"
            @keyup.enter="joinRoom"
          />
          <Button
            :disabled="!roomIdInput.trim()"
            @click="joinRoom"
          >
            Подключиться
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
