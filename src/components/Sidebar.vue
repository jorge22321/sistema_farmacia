<script setup lang="ts">
import Logo from '@/components/Logo.vue'
import miLogoWebp from '@/assets/Logo2.png'
import NavItem from '@/components/NavItem.vue'
import AppIcon from '@/components/AppIcon.vue'
import DropdownItem from '@/components/DropdownItem.vue'

const props = defineProps<{ isCollapsed: boolean }>()
const emit = defineEmits(['toggle-sidebar'])

function handleToggle() {
  emit('toggle-sidebar')
}
</script>

<template>
  <aside class="sidebar" :class="{ 'is-collapsed': props.isCollapsed }">
    <div v-if="props.isCollapsed" class="toggle-wrapper">
      <button @click="handleToggle" class="sidebar-toggle">
        <AppIcon name="bars" />
      </button>
    </div>

    <div class="logo">
      <Logo to="/dashboard" :imgSrc="miLogoWebp" />
    </div>

    <nav class="navigation">
      <ul>
        <!-- NavItems simples -->
        <NavItem to="/dashboard" :isCollapsed="props.isCollapsed">
          <template #text>Panel Principal</template>
          <AppIcon name="tachometer-alt" slot="default" />
        </NavItem>

        <NavItem to="/pos" :isCollapsed="props.isCollapsed">
          <template #text>Punto de Venta</template>
          <AppIcon name="cash-register" slot="default" />
        </NavItem>

        <!-- NavItems con submenús - SIN "to" funcional -->
        <NavItem to="#" :isCollapsed="props.isCollapsed">
          <template #text>Dispensación</template>
          <AppIcon name="prescription-bottle-alt" slot="default" />

          <template #submenu>
            <ul>
              <DropdownItem icon="plus" to="/dispensacion/dispensador-recetas"
                >Dispensador de Recetas</DropdownItem
              >
              <DropdownItem icon="history" to="/dispensacion/historial">Historial</DropdownItem>
            </ul>
          </template>
        </NavItem>

        <NavItem to="#" :isCollapsed="props.isCollapsed">
          <template #text>Inventario</template>
          <AppIcon name="pills" slot="default" />

          <template #submenu>
            <ul>
              <DropdownItem icon="clipboard-list" to="/inventario/control-producto">
                Control de Productos
              </DropdownItem>
              <DropdownItem icon="plus" to="/inventario/añadir-lote"> Añadir Lote </DropdownItem>
              <DropdownItem icon="list-alt" to="/inventario/ver-lotes">
                Ver Lotes (Stock)
              </DropdownItem>
              <DropdownItem icon="box" to="/inventario/ver-productos"> Ver Productos </DropdownItem>
              <DropdownItem icon="tags" to="/inventario/ver-categoria">
                Ver Categorías
              </DropdownItem>
            </ul>
          </template>
        </NavItem>

        <NavItem to="#" :isCollapsed="props.isCollapsed">
          <template #text>Informes</template>
          <AppIcon name="chart-pie" slot="default" />

          <template #submenu>
            <ul>
              <DropdownItem icon="file-invoice-dollar" to="/informes/informe-ventas"
                >Informe de Ventas</DropdownItem
              >
              <DropdownItem icon="exclamation-triangle" to="/informes/lotes-por-vencer"
                >Lotes por Vencer</DropdownItem
              >
              <DropdownItem icon="box-open" to="/informes/stock-bajo">Stock Bajo</DropdownItem>
            </ul>
          </template>
        </NavItem>

        <NavItem to="#" :isCollapsed="props.isCollapsed">
          <template #text>Administración</template>
          <AppIcon name="cogs" slot="default" />

          <template #submenu>
            <ul>
              <DropdownItem icon="users-cog" to="/administracion/empleados">Empleados</DropdownItem>

              <DropdownItem icon="pallet" to="/administracion/ubicacion">Ubicaciones</DropdownItem>
              <DropdownItem icon="building" to="/administracion/laboratorio"
                >Laboratorios</DropdownItem
              >
            </ul>
          </template>
        </NavItem>
      </ul>
    </nav>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 170px;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: width 0.3s ease;
  --nav-link-justify: flex-start;
  --icon-margin: 0.5rem;
}

.sidebar.is-collapsed {
  width: 58px;
  --nav-link-justify: center;
  --icon-margin: 0;
}

.logo {
  padding: 1rem 0 1rem 0;
  text-align: center;
}

.navigation ul {
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.toggle-wrapper {
  display: flex;
  justify-content: center;
}

.sidebar-toggle {
  margin-top: 13px;
  background: #ffffff;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0.6rem 0.4rem 0.4rem 0.4rem;
  display: flex;
}

.navigation :deep(.dropdown-item) {
  margin-left: 1rem;
}
</style>
