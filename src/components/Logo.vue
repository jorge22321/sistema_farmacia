<script setup lang="ts">
import { RouterLink } from 'vue-router'

// Definimos las "props" que el componente acepta
defineProps<{
  // La URL a la que el logo debe enlazar
  to: string
  // La ruta de la imagen (este es tu "apartado")
  // Es opcional (por si solo quieres texto)
  imgSrc?: string
}>()
</script>

<template>
  <RouterLink :to="to" class="logo-link">
    <img v-if="imgSrc" :src="imgSrc" alt="Logo" class="logo-image" />

    <span class="logo-text">
      <slot />
    </span>
  </RouterLink>
</template>

<style scoped>
.logo-link {
  display: flex;
  align-items: center;
  justify-content: center;
  /* 12px de espacio entre imagen y texto */
  text-decoration: none;
  color: inherit; /* Hereda el color del padre (ej. blanco) */
}

.logo-image {
  height: 52px; /* Ajusta la altura de tu logo */
  width: 52px; /* Ajusta el ancho de tu logo */
  object-fit: contain;
}
</style>
