src/App.vue
<script setup lang="ts">
import { RouterView } from 'vue-router'
import { onMounted } from 'vue'

onMounted(async () => {
  try {
    // Fíjate que NO ponemos http://localhost:3000, solo la ruta
    const respuesta = await fetch('/api/ping')
    const datos = await respuesta.json()
    console.log('Respuesta del servidor:', datos)
  } catch (error) {
    console.error('Error conectando al backend:', error)
  }
})
</script>

<template>
  <RouterView />
</template>

<style>
/* Estilos globales (si los necesitas) */
/* Es buena idea resetear márgenes */
body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
