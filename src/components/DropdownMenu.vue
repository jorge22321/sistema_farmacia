<script setup lang="ts">
const props = defineProps<{
  // Puede flotar bajo el header, al costado del sidebar o dentro de una tarjeta
  position?: 'header' | 'sidebar' | 'card'
}>()

const positionClass = `menu-${props.position || 'header'}`
</script>

<template>
  <div class="dropdown-menu" :class="positionClass" @click.stop>
    <ul>
      <slot />
    </ul>
  </div>
</template>

<style scoped>
/* --- BASE --- */
.dropdown-menu {
  position: absolute;
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  z-index: 200;
  animation: fadeIn 0.12s ease-out;
  overflow: hidden;
  min-width: 130px;
}

/* Lista interna */
ul {
  list-style: none;
  margin: 0;
  padding: 0.4rem;
}

/* --- VARIANTES DE POSICIÓN --- */

/* 🔹 Menú para el header */
.menu-header {
  top: calc(100% + 8px);
  right: 0;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

/* 🔹 Menú para el sidebar */
.menu-sidebar {
  left: calc(100% + 6px);
  top: 0;
  box-shadow: 4px 0 12px rgba(0, 0, 0, 0.08);
}

/* 🔹 Menú para tarjetas (como en SeeCategoryView) */
.menu-card {
  top: calc(100% + 6px); /* Justo debajo del botón */
  right: 0; /* Alineado a la derecha del botón */
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

/* --- Animación suave --- */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
