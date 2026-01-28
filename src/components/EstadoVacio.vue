<!-- src/components/EstadoVacio.vue -->
<script setup lang="ts">
import AppIcon from './AppIcon.vue'

interface Props {
  titulo?: string
  mensaje?: string
  icono?: string
}

withDefaults(defineProps<Props>(), {
  titulo: 'No hay recetas pendientes',
  mensaje: 'Todas las recetas han sido procesadas',
  icono: 'check-circle',
})
</script>

<template>
  <div class="estado-vacio">
    <AppIcon :name="icono" />
    <h3>{{ titulo }}</h3>
    <p>{{ mensaje }}</p>
  </div>
</template>

<style scoped>
.estado-vacio {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.estado-vacio h3 {
  margin: 15px 0 10px 0;
  color: #2c3e50;
}
</style>
