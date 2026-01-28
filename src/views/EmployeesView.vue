<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import BaseTable from '@/components/BaseTable.vue'
import BaseButton from '@/components/BaseButton.vue'
import AppIcon from '@/components/AppIcon.vue'
import BaseBadge from '@/components/BaseBadge.vue'
import StatusBadge from '@/components/StatusBadge.vue'

// Definimos la estructura exacta que usa tu tabla visual
interface Empleado {
  id: number
  nombre: string
  apellido: string
  correo: string
  rol: string
  esta_activo: boolean
}

// Estado reactivo
const empleados = ref<Empleado[]>([])
const loading = ref(false)

// 🧭 Encabezados de tabla
const headers = ['ID', 'Nombre', 'Apellido', 'Correo', 'Rol', 'Estado', 'Acciones']

// 🔍 Filtros
const filters = [
  { label: 'Rol', options: ['Todos', 'Administrador', 'Farmacéutico', 'Técnico'] },
  { label: 'Estado', options: ['Todos', 'Activo', 'Inactivo'] },
]

// ✅ FUNCIÓN: Cargar empleados desde el Backend
const cargarEmpleados = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')

    // Petición al endpoint que creamos
    const { data } = await axios.get('http://localhost:3000/api/empleados', {
      headers: { Authorization: `Bearer ${token}` },
    })

    // Mapeo de datos: BD (snake_case) -> Vista (camelCase)
    empleados.value = data.map((item: any) => ({
      id: item.empleado_id,
      nombre: item.nombres,
      apellido: item.apellidos,
      // Usamos el correo real de la BD. Si faltara, mostramos el usuario como respaldo.
      correo: item.correo || item.usuario,
      rol: item.rol, // Viene como string ("Administrador") gracias al JOIN en el backend
      esta_activo: Boolean(item.esta_activo), // Convertimos 1/0 a true/false
    }))
  } catch (error) {
    console.error('Error al cargar empleados:', error)
    // Aquí podrías poner una alerta si gustas
  } finally {
    loading.value = false
  }
}

// Cargar al montar el componente
onMounted(() => {
  cargarEmpleados()
})

// 🔧 Métodos de acciones (Logica visual mantenida)
function editarEmpleado(empleado: Empleado) {
  console.log('Editar empleado:', empleado)
  // Futuro: router.push(`/empleados/editar/${empleado.id}`)
}

function eliminarEmpleado(empleado: Empleado) {
  console.log('Eliminar empleado:', empleado)
  if (confirm(`¿Estás seguro de eliminar a ${empleado.nombre}?`)) {
    // Futuro: await axios.delete(...)
  }
}

function suspenderEmpleado(empleado: Empleado) {
  console.log('Suspender/Activar empleado:', empleado)
  // Futuro: await axios.patch(...)
}
</script>

<template>
  <div class="empleados-view">
    <div class="header">
      <BaseButton variant="primary"> <AppIcon name="plus" /> Nuevo Empleado </BaseButton>
    </div>

    <div v-if="loading" class="loading-text">Cargando personal...</div>

    <BaseTable v-else :headers="headers" :rows="empleados" search-key="nombre" :filters="filters">
      <template #row="{ row }">
        <td>{{ row.id }}</td>
        <td>{{ row.nombre }}</td>
        <td>{{ row.apellido }}</td>
        <td>{{ row.correo }}</td>

        <td>
          <BaseBadge
            :variant="
              row.rol === 'Administrador'
                ? 'danger'
                : row.rol === 'Farmacéutico'
                  ? 'info'
                  : 'primary'
            "
          >
            {{ row.rol }}
          </BaseBadge>
        </td>

        <td>
          <StatusBadge :status="row.esta_activo ? 'active' : 'inactive'">
            {{ row.esta_activo ? 'Activo' : 'Inactivo' }}
          </StatusBadge>
        </td>

        <td class="acciones">
          <BaseButton variant="primary" bordered width="32" @click="editarEmpleado(row)">
            <AppIcon name="pen" family="solid" />
          </BaseButton>

          <BaseButton variant="danger" bordered width="32" @click="eliminarEmpleado(row)">
            <AppIcon name="trash-can" family="regular" />
          </BaseButton>

          <BaseButton variant="warning" bordered width="32" @click="suspenderEmpleado(row)">
            <AppIcon name="user-slash" family="solid" />
          </BaseButton>
        </td>
      </template>
    </BaseTable>
  </div>
</template>

<style scoped>
.empleados-view {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  padding: 1rem;
}

.header {
  padding-top: 20px;
  display: flex;
  justify-content: end;
  align-items: center;
  flex-wrap: wrap;
}

.title {
  font-size: 1.1rem;
  font-weight: 700;
  color: #333;
}

/* --- Acciones --- */
.acciones {
  display: flex;
  gap: 0.4rem;
  align-items: center;
}

.acciones button {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.3rem 0.5rem;
  margin: 0.2rem 0;
}
</style>
