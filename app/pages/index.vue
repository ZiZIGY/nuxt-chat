<script setup lang="ts">
  import { Button } from '@/components/ui/button';

  const roomIdInput = ref('');

  function createRoom() {
    // Генерируем случайный ID комнаты
    const newRoomId = crypto.randomUUID();
    navigateTo(`/room/${newRoomId}`);
  }

  function joinRoom() {
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
