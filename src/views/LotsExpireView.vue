<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios' // ✅ Importamos axios
import BaseTable from '@/components/BaseTable.vue'
import BaseButton from '@/components/BaseButton.vue'
import TableSearch from '@/components/TableSearch.vue'

// --- Tipos ---
interface Lote {
  lote_id: number
  producto_nombre: string
  concentracion: string
  numero_lote: string
  fecha_vencimiento: string
  cantidad_stock: number
  precio_venta: number
}

// --- Estado ---
const lotes = ref<Lote[]>([])
const search = ref('')

// --- Carga de datos desde Backend ---
const cargarLotes = async () => {
  try {
    const token = localStorage.getItem('token')
    // ✅ Llamada real a tu API protegida
    const { data } = await axios.get('http://localhost:3000/api/lotes/vencimiento', {
      headers: { Authorization: `Bearer ${token}` },
    })
    lotes.value = data
  } catch (error) {
    console.error('Error al cargar lotes:', error)
  }
}

onMounted(() => {
  cargarLotes() // ✅ Ejecutamos la carga real
})

// --- Cálculo del estado (Mantenemos tu lógica) ---
function estadoLote(lote: Lote) {
  const hoy = new Date()
  const vencimiento = new Date(lote.fecha_vencimiento)
  const diff = Math.floor((vencimiento.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24))

  if (diff < 0) return 'Vencido'
  if (diff <= 30) return 'Por vencer'
  return 'Activo'
}

// --- Filtro de búsqueda ---
const lotesFiltrados = computed(() => {
  const term = search.value.toLowerCase()
  return lotes.value.filter(
    (l) =>
      l.producto_nombre.toLowerCase().includes(term) || l.numero_lote.toLowerCase().includes(term),
  )
})

// --- Exportar CSV ---
function exportarCSV() {
  const header = [
    'ID',
    'Producto',
    'Concentración',
    'N° Lote',
    'Fecha Vencimiento',
    'Stock',
    'Estado',
  ]
  const rows = lotesFiltrados.value.map((l) => [
    l.lote_id,
    l.producto_nombre,
    l.concentracion,
    l.numero_lote,
    new Date(l.fecha_vencimiento).toLocaleDateString(), // Formato legible para CSV
    l.cantidad_stock,
    estadoLote(l),
  ])
  const csvContent =
    'data:text/csv;charset=utf-8,' + [header, ...rows].map((r) => r.join(',')).join('\n')
  const link = document.createElement('a')
  link.setAttribute('href', encodeURI(csvContent))
  link.setAttribute('download', 'lotes_por_vencer.csv')
  link.click()
}
</script>

<template>
  <div class="lots-expire-view">
    <div class="actions">
      <BaseButton variant="primary" @click="exportarCSV">Exportar CSV</BaseButton>
    </div>

    <BaseTable
      :headers="[
        'ID Lote',
        'Producto',
        'Concentración',
        'N° de Lote',
        'Fecha de Vencimiento',
        'Días Restantes',
        'Stock',
        'Estado',
      ]"
      :rows="lotes"
      searchKey="producto_nombre"
      :filters="[{ label: 'Estado', options: ['Activo', 'Por vencer', 'Vencido'] }]"
    >
      <template #row="{ row }">
        <td>{{ row.lote_id }}</td>
        <td>{{ row.producto_nombre }}</td>
        <td>{{ row.concentracion }}</td>
        <td>{{ row.numero_lote }}</td>
        <td>{{ new Date(row.fecha_vencimiento).toLocaleDateString() }}</td>
        <td>
          {{
            Math.floor(
              (new Date(row.fecha_vencimiento).getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24),
            )
          }}
        </td>
        <td>{{ row.cantidad_stock }}</td>
        <td :class="estadoLote(row).toLowerCase().replace(' ', '-')">{{ estadoLote(row) }}</td>
      </template>
    </BaseTable>
  </div>
</template>

<style scoped>
.lots-expire-view {
  padding: 2rem 3rem;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
}

.actions {
  display: flex;
  justify-content: end;
  gap: 0.5rem;
}

/* --- Colores de estado --- */
td.vencido {
  color: #dc3545;
  font-weight: 600;
}
td.por-vencer {
  color: #ffc107;
  font-weight: 600;
}
td.activo {
  color: #28a745;
}
</style>
