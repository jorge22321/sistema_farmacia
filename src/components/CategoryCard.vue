<script setup lang="ts">
import { ref } from 'vue'
import AppIcon from '@/components/AppIcon.vue'
import DropdownItem from '@/components/DropdownItem.vue'

// 1. Definimos la interfaz que esperamos
interface Categoria {
  categoria_id: number
  nombre: string
  descripcion: string
  estado: string
}

// 2. Recibimos la lista de categorías como prop
defineProps<{
  categorias: Categoria[]
}>()

// 3. Definimos los eventos que este componente emitirá
const emit = defineEmits<{
  (e: 'edit', id: number): void
  (e: 'delete', id: number): void
}>()

// 4. El estado del menú ahora vive dentro de este componente
const menuOpen = ref<number | null>(null)
</script>

<template>
  <div class="grid">
    <div
      v-for="c in categorias"
      :key="c.categoria_id"
      class="card"
      :class="{ inactivo: c.estado === 'Inactivo' }"
    >
      <div class="card-header">
        <AppIcon name="tags" />
        <h3>{{ c.nombre }}</h3>

        <div class="menu-wrapper">
          <button
            class="menu-button"
            @click="menuOpen = menuOpen === c.categoria_id ? null : c.categoria_id"
          >
            <AppIcon name="ellipsis-vertical" />
          </button>

          <ul v-if="menuOpen === c.categoria_id" class="dropdown-menu">
            <DropdownItem icon="pen" @click="emit('edit', c.categoria_id)"> Editar </DropdownItem>
            <DropdownItem icon="trash" @click="emit('delete', c.categoria_id)">
              Eliminar
            </DropdownItem>
          </ul>
        </div>
      </div>

      <p class="descripcion">{{ c.descripcion }}</p>

      <div class="estado">
        <span :class="c.estado === 'Activo' ? 'activo' : 'inactivo'">{{ c.estado }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 6. Todos los estilos del .grid y .card se movieron aquí */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 1rem;
}

.card {
  background-color: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
  position: relative;
}
.card:hover {
  transform: translateY(-3px);
}
.card.inactivo {
  opacity: 0.85;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.4rem;
}
.card-header h3 {
  font-size: 0.95rem;
  font-weight: 600;
  color: #333;
  flex-grow: 1;
}

.menu-wrapper {
  position: relative;
}
.menu-button {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.2rem;
  border-radius: 4px;
}
.menu-button:hover {
  background: #f4f4f4;
}
.dropdown-menu {
  position: absolute;
  top: 1rem;
  right: 0;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 0.3rem;
  z-index: 10;
  width: 130px;
}

.descripcion {
  font-size: 0.8rem;
  color: #555;
  margin: 0.5rem 0;
  flex-grow: 1;
}
.estado {
  font-size: 0.8rem;
}
.activo {
  color: #28a745;
  font-weight: 600;
}
.inactivo {
  color: #dc3545;
  font-weight: 600;
}
</style>
