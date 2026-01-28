<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseTable from '@/components/BaseTable.vue'

// 🔹 Tipo de datos
interface Producto {
  producto_id: number
  nombre: string
  concentracion: string
  formato: string
  categoria: string // Vendrá el nombre gracias al JOIN del backend
  laboratorio: string // Vendrá el nombre gracias al JOIN del backend
  ubicacion: string // Vendrá "Sección - Estante"
  requiere_receta: boolean
}

// 🔹 Configuración
const router = useRouter()
const productos = ref<Producto[]>([])

// 🔹 Helper Auth (Token)
function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// 🔹 Cargar datos desde API
onMounted(async () => {
  try {
    const res = await fetch('/api/productos', {
      headers: getAuthHeaders(),
    })

    // Manejo de sesión expirada
    if (res.status === 401) {
      router.push('/login')
      return
    }

    if (!res.ok) throw new Error('Error al cargar productos')

    productos.value = await res.json()
  } catch (err) {
    console.error(err)
    // Opcional: alert('Error de conexión')
  }
})

// 🔹 Filtros únicos (Se calculan automáticos cuando llegan los datos del API)
const categorias = computed(() => {
  const cats = productos.value.map((p) => p.categoria).filter(Boolean) // Filtramos nulos
  return Array.from(new Set(cats)).sort()
})

const laboratorios = computed(() => {
  const labs = productos.value.map((p) => p.laboratorio).filter(Boolean)
  return Array.from(new Set(labs)).sort()
})
</script>

<template>
  <div class="see-product-view">
    <BaseTable
      :headers="[
        'ID',
        'Nombre',
        'Concentración',
        'Formato',
        'Categoría',
        'Laboratorio',
        'Ubicación',
        'Requiere Receta',
      ]"
      :rows="productos"
      searchKey="nombre"
      :filters="[
        { label: 'Categoría', options: categorias },
        { label: 'Laboratorio', options: laboratorios },
        { label: 'Requiere receta', options: ['Sí', 'No'] },
      ]"
    >
      <template #row="{ row }">
        <td>{{ row.producto_id }}</td>
        <td>{{ row.nombre }}</td>
        <td>{{ row.concentracion || '-' }}</td>
        <td>{{ row.formato || '-' }}</td>
        <td>{{ row.categoria || 'Sin Categoría' }}</td>
        <td>{{ row.laboratorio || '-' }}</td>
        <td>{{ row.ubicacion || '-' }}</td>
        <td>
          <span :class="row.requiere_receta ? 'requiere' : 'no-requiere'">
            {{ row.requiere_receta ? 'Sí' : 'No' }}
          </span>
        </td>
      </template>
    </BaseTable>
  </div>
</template>

<style scoped>
.see-product-view {
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
}

h2 {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #333;
}

/* --- Colores receta --- */
.requiere {
  color: #dc3545;
  font-weight: 600;
}
.no-requiere {
  color: #28a745;
  font-weight: 600;
}
</style>
