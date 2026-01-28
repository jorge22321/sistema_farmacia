<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router' // 1. Importamos el router
import UserAvatar from '@/components/UserAvatar.vue'
import AppIcon from '@/components/AppIcon.vue'
import DropdownMenu from '@/components/DropdownMenu.vue'
import DropdownItem from '@/components/DropdownItem.vue'

// Definimos la estructura del usuario (Ahora con email/correo)
interface User {
  name: string
  correo: string // Cambiado de username a correo
  avatarUrl?: string
  rol?: number
}

// Recibimos los datos del usuario real
defineProps<{ user: User }>()

const router = useRouter()
const isOpen = ref(false)
const menuRef = ref<HTMLDivElement | null>(null)

function toggleMenu() {
  isOpen.value = !isOpen.value
}

// --- FUNCIÓN CERRAR SESIÓN ---
function handleLogout() {
  // 1. Borramos las "llaves" del navegador
  localStorage.removeItem('token')
  localStorage.removeItem('usuario')

  // 2. Cerramos el menú visualmente
  isOpen.value = false

  // 3. Redirigimos al Login inmediatamente
  router.push('/login')
}

// Cerrar al hacer clic fuera
const handleClickOutside = (event: MouseEvent) => {
  if (menuRef.value && !menuRef.value.contains(event.target as Node)) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="user-menu-container" ref="menuRef" @click="toggleMenu">
    <div class="user-info">
      <span class="user-name">{{ user.name }}</span>
      <span class="user-email">{{ user.correo }}</span>
    </div>

    <UserAvatar :src="user.avatarUrl || ''" :alt="user.name" />

    <AppIcon name="chevron-down" class="menu-chevron" :class="{ 'is-open': isOpen }" />

    <DropdownMenu v-if="isOpen" position="header">
      <DropdownItem icon="user-circle">Mi Perfil</DropdownItem>
      <DropdownItem icon="cog">Configuración</DropdownItem>
      <DropdownItem icon="sign-out-alt" @click="handleLogout"> Cerrar Sesión </DropdownItem>
    </DropdownMenu>
  </div>
</template>

<style scoped>
.user-menu-container {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.user-menu-container:hover {
  background-color: #f4f4f4;
}

.user-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  font-size: 0.8rem;
  line-height: 1.3;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.user-email {
  /* Cambiado de username a email */
  color: #777;
  font-size: 0.7rem;
  max-width: 150px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis; /* Pone '...' si el correo es muy largo */
}

.menu-chevron {
  font-size: 0.7rem;
  color: #555;
  transition: transform 0.2s ease;
}

.menu-chevron.is-open {
  transform: rotate(180deg);
}

.menu-chevron :deep(i) {
  margin-right: 0;
}
</style>
