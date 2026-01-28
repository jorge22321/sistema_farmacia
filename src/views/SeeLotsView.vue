<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseTable from '@/components/BaseTable.vue'

interface Lote {
  lote_id: number
  producto_nombre: string
  concentracion: string
  numero_lote: string
  fecha_vencimiento: string
  cantidad_stock: number
  precio_costo: number
  precio_venta: number
}

// --- Configuración ---
const router = useRouter()
const lotes = ref<Lote[]>([])

// --- Helper Auth ---
function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// --- Cargar Datos ---
onMounted(async () => {
  try {
    const res = await fetch('/api/lotes', {
      headers: getAuthHeaders(),
    })

    if (res.status === 401) {
      // Si la sesión expiró
      router.push('/login')
      return
    }

    if (!res.ok) throw new Error('Error al cargar lotes')

    // El backend ya devuelve los nombres de campos mapeados correctamente
    // gracias a los "AS" en la consulta SQL
    lotes.value = await res.json()
  } catch (err) {
    console.error(err)
    // Opcional: mostrar un toast o alerta discreta
  }
})

// --- Estado del lote (Lógica de negocio) ---
function estadoLote(lote: Lote) {
  // Convertimos strings de fecha a objetos Date para comparar
  // Aseguramos compatibilidad si la fecha viene con zona horaria o solo YYYY-MM-DD
  const hoy = new Date()
  const vencimiento = new Date(lote.fecha_vencimiento)

  // Normalizamos a medianoche para evitar problemas de horas
  hoy.setHours(0, 0, 0, 0)
  // Ajuste por zona horaria si es necesario, pero simple works best:
  // (vencimiento - hoy) en días
  const diffTime = vencimiento.getTime() - hoy.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (lote.cantidad_stock <= 0) return 'Sin stock'
  if (diffDays < 0) return 'Vencido'
  if (diffDays <= 30) return 'Por vencer' // Menos de 30 días
  return 'Activo'
}

// --- Color visual según estado ---
function estadoColor(estado: string) {
  switch (estado) {
    case 'Vencido':
      return '#dc3545' // Rojo
    case 'Por vencer':
      return '#ffc107' // Amarillo/Naranja
    case 'Sin stock':
      return '#6c757d' // Gris
    default:
      return '#28a745' // Verde
  }
}
</script>

<template>
  <div class="see-lotes-view">
    <BaseTable
      :headers="[
        'ID',
        'Producto',
        'Concentración',
        'N° de Lote',
        'Vencimiento',
        'Stock',
        'Costo (S/)',
        'Venta (S/)',
        'Estado',
      ]"
      :rows="lotes"
      searchKey="producto_nombre"
      :filters="[{ label: 'Estado', options: ['Activo', 'Por vencer', 'Vencido', 'Sin stock'] }]"
    >
      <template #row="{ row }">
        <td>{{ row.lote_id }}</td>
        <td>{{ row.producto_nombre }}</td>
        <td>{{ row.concentracion || '-' }}</td>
        <td>{{ row.numero_lote }}</td>
        <td>{{ row.fecha_vencimiento }}</td>
        <td>{{ row.cantidad_stock }}</td>
        <td>{{ Number(row.precio_costo).toFixed(2) }}</td>
        <td>{{ Number(row.precio_venta).toFixed(2) }}</td>

        <td :style="{ color: estadoColor(estadoLote(row)), fontWeight: 600 }">
          {{ estadoLote(row) }}
        </td>
      </template>
    </BaseTable>
  </div>
</template>

<style scoped>
.see-lotes-view {
  padding: 1.5rem;
  background: #fff;
  border-radius: 12px;
}
</style>
