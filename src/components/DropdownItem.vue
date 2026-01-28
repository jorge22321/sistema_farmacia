//src/components/DropdownItem.vue
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps<{
  icon?: string // Prop opcional para un icono
  to?: string // Nueva prop opcional para navegación
}>()

// Define el evento 'click' que el padre puede escuchar
const emit = defineEmits(['click'])

function handleClick() {
  emit('click')
}
</script>

<template>
  <li class="dropdown-item">
    <!-- Si hay prop 'to', usa RouterLink -->
    <RouterLink v-if="to" :to="to" class="dropdown-link" @click.stop>
      <AppIcon v-if="icon" :name="icon" class="item-icon" />
      <span class="item-text">
        <slot />
      </span>
    </RouterLink>

    <!-- Si no hay 'to', funciona como antes -->
    <div v-else @click="handleClick" class="dropdown-content">
      <AppIcon v-if="icon" :name="icon" class="item-icon" />
      <span class="item-text">
        <slot />
      </span>
    </div>
  </li>
</template>

<style scoped>
.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.6rem 0.6rem;
  font-size: 0.7rem;
  color: #333;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  white-space: nowrap;
}

.dropdown-item:hover {
  background-color: #f4f4f4;
}

.dropdown-link,
.dropdown-content {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: inherit;
  width: 100%;
}

.item-icon {
  font-size: 0.8rem;
  color: #555;
  margin-right: 0.5rem; /* Añadido para separar icono y texto */
  flex: 0 0 16px; /* Asegura que los iconos tengan el mismo ancho */
}

.item-text {
  line-height: 1;
}
</style>
