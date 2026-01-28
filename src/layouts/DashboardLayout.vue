<script setup lang="ts">
import { ref, onMounted } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'

// 1. Estado del Sidebar (Colapsado/Expandido)
const isCollapsed = ref(false)

function toggleSidebar() {
  isCollapsed.value = !isCollapsed.value
}

// 2. Estado del Usuario (Datos Reales)
// Iniciamos con datos por defecto para evitar errores si tarda en cargar
const currentUser = ref({
  name: 'Cargando...',
  correo: '...',
  avatarUrl: '',
})

// 3. Al montar el Layout, leemos la "memoria" del navegador
onMounted(() => {
  const usuarioGuardado = localStorage.getItem('usuario')

  if (usuarioGuardado) {
    try {
      const datos = JSON.parse(usuarioGuardado)

      // Actualizamos la variable reactiva con los datos de la BD
      currentUser.value = {
        name: datos.nombre || 'Administrador',
        // Como tu tabla Empleados usa 'usuario' y no 'email', lo mostramos como handle (@usuario)
        correo: datos.correo || 'Sin correo',
        avatarUrl: '', // Aquí podrías poner una URL si tuvieras fotos
      }
    } catch (e) {
      console.error('Error al leer datos del usuario', e)
    }
  }
})
</script>

<template>
  <div class="dashboard-layout" :class="{ 'is-collapsed': isCollapsed }">
    <Sidebar :isCollapsed="isCollapsed" @toggle-sidebar="toggleSidebar" />

    <main class="main-content">
      <Header :isCollapsed="isCollapsed" @toggle-sidebar="toggleSidebar" :user="currentUser" />

      <div class="page-view">
        <RouterView />
      </div>
    </main>
  </div>
</template>

<style scoped>
/* LOS ESTILOS DE GRID SON EXACTAMENTE LOS MISMOS DE ANTES */

.dashboard-layout {
  display: grid;

  grid-template-columns: var(--sidebar-width, 170px) 1fr;

  min-height: 100vh;

  transition: grid-template-columns 0.3s ease;
}

.dashboard-layout.is-collapsed {
  --sidebar-width: 58px;
}

.main-content {
  display: grid;

  grid-template-rows: 45px 1fr;

  overflow: hidden;
}

.page-view {
  overflow-y: auto;
}
</style>
