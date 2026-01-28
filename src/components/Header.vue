<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'
import UserMenu from '@/components/UserMenu.vue'

// 1. DEFINIR PROPS: Ahora aceptamos 'user' desde el padre (Layout)
const props = defineProps<{
  isCollapsed: boolean
  user: {
    name: string
    correo: string
    avatarUrl?: string
  }
}>()

const emit = defineEmits(['toggle-sidebar'])

function handleToggle() {
  emit('toggle-sidebar')
}

// BORRADO: Ya no necesitamos el "loggedInUser" falso aquí.
</script>

<template>
  <header class="app-header">
    <div class="header-left">
      <button v-if="!props.isCollapsed" @click="handleToggle" class="toggle-btn">
        <AppIcon name="bars" />
      </button>
    </div>

    <div class="user-menu-wrapper">
      <UserMenu :user="props.user" />
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 45px;
  background-color: #ffffff;
  /* Sombra suave para separar del contenido */

  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-menu-wrapper {
  display: flex;
  align-items: center;
}

/* Estilo para el botón de toggle */
.toggle-btn {
  background: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.toggle-btn:hover {
  background: #f0eeee;
}
</style>
