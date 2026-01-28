<script setup lang="ts">
defineProps<{
  src: string
  alt?: string
}>()
</script>

<template>
  <div class="avatar">
    <img :src="src" :alt="alt || 'Imagen de perfil'" />
  </div>
</template>

<style scoped>
.avatar {
  width: 32px; /* Tamaño pequeño para el header */
  height: 32px;
  border-radius: 50%; /* Lo hace redondo */
  overflow: hidden; /* Corta la imagen */
  background-color: #eee; /* Color de fondo mientras carga */
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* Asegura que la imagen llene el círculo */
}
</style>
