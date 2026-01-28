<!-- src/components/NavItem.vue -->
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { ref, computed, useSlots } from 'vue'
import AppIcon from '@/components/AppIcon.vue'

const props = defineProps<{
  to: string
  isCollapsed: boolean
}>()

const slots = useSlots()
const hasSubmenu = computed(() => !!slots.submenu)
const isOpen = ref(false)

function toggleMenu(event: MouseEvent) {
  // SI TIENE SUBMENÚ: Solo toggle, no navega
  if (hasSubmenu.value) {
    event.preventDefault()
    event.stopPropagation()
    isOpen.value = !isOpen.value
    return
  }

  // SI NO TIENE SUBMENÚ: Navega normalmente
  // (el RouterLink se encarga de la navegación)
}
</script>

<template>
  <li class="sidebar-item" :class="{ 'is-open': isOpen, 'is-collapsed': props.isCollapsed }">
    <!-- Para items CON submenú: usamos <a> para evitar navegación -->
    <a v-if="hasSubmenu" href="#" class="nav-link has-submenu" @click="toggleMenu">
      <div class="nav-content">
        <!-- Icono principal -->
        <AppIcon
          v-if="$slots.default?.()[0]?.type === AppIcon"
          :name="$slots.default?.()[0]?.props?.name"
          class="nav-icon"
        />

        <!-- Texto -->
        <span class="nav-text">
          <slot name="text" />
        </span>
      </div>

      <!-- Flecha toggle -->
      <AppIcon
        v-if="hasSubmenu && !props.isCollapsed"
        name="chevron-right"
        class="toggle-arrow"
        :class="{ 'is-open': isOpen }"
      />
    </a>

    <!-- Para items SIN submenú: usamos RouterLink para navegación -->
    <RouterLink v-else :to="to" class="nav-link" @click="toggleMenu">
      <div class="nav-content">
        <!-- Icono principal -->
        <AppIcon
          v-if="$slots.default?.()[0]?.type === AppIcon"
          :name="$slots.default?.()[0]?.props?.name"
          class="nav-icon"
        />

        <!-- Texto -->
        <span class="nav-text">
          <slot name="text" />
        </span>
      </div>
    </RouterLink>

    <!-- Submenú -->
    <div v-if="hasSubmenu" class="submenu-wrapper">
      <slot name="submenu" />
    </div>
  </li>
</template>

<style scoped>
.sidebar-item {
  list-style: none;
  width: 100%;
  position: relative;
}

.nav-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.7rem;
  flex-grow: 1;
  padding: 0.7rem;
  color: #333;
  text-decoration: none;
  border-radius: 6px;
  transition: background-color 0.2s;
}

.nav-link:hover {
  background-color: #f4f4f4;
  color: #007bff;
}

.nav-content {
  display: flex;
  align-items: center;
  white-space: nowrap;
  overflow: hidden;
  flex-grow: 1;
}

.nav-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: var(--icon-margin, 0.5rem);
  flex: 0 0 20px;
  font-size: 0.8rem;
}

.nav-text {
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  max-width: 120px;
  vertical-align: middle;
  transition:
    max-width 0.22s ease,
    opacity 0.18s ease,
    transform 0.18s ease;
  opacity: 1;
  transform: translateX(0);
}

.sidebar.is-collapsed .nav-text {
  max-width: 0;
  opacity: 0;
  transform: translateX(-6px);
}

.toggle-arrow {
  font-size: 0.6rem;
  color: #888;
  flex-shrink: 0;
  padding: 0.2rem;
  transition: transform 0.2s ease;
}

.toggle-arrow.is-open {
  transform: rotate(90deg);
}

/* Estilos de submenú ACORDEÓN (cuando NO está colapsado) */
.submenu-wrapper {
  overflow: hidden;
  max-height: 0;
  transition: max-height 0.3s ease-in-out;
  background-color: #fcfcfc;
}

.sidebar-item.is-open .submenu-wrapper {
  max-height: 500px;
}

/* Estilos de submenú FLOTANTE (cuando SÍ está colapsado) */
.sidebar-item.is-collapsed .submenu-wrapper {
  max-height: unset;
  transition: none;
  display: none;
  position: absolute;
  left: 100%;
  top: 0;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  min-width: 170px;
  padding: 0.5rem;
  z-index: 100;
}

.sidebar-item.is-collapsed:hover > .submenu-wrapper {
  display: block;
}
</style>
