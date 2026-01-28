<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseTable from '@/components/BaseTable.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseLink from '@/components/BaseLink.vue'

// --- Interfaces ---
interface Venta {
  venta_id: number
  fecha_venta: string
  hora_venta: string
  empleado: string
  monto_total: number
  metodo_pago: string
  factura_url?: string
}

// --- Estado ---
const router = useRouter()
const ventas = ref<Venta[]>([])
const search = ref('')
const filtroFechaInicio = ref('')
const filtroFechaFin = ref('')
const filtroEmpleado = ref('')

// --- Helper Auth ---
function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// --- Cargar datos REALES desde Backend ---
onMounted(async () => {
  try {
    const res = await fetch('/api/ventas', {
      headers: getAuthHeaders(),
    })

    if (res.status === 401) {
      router.push('/login')
      return
    }

    if (!res.ok) throw new Error('Error al cargar ventas')

    // El backend ya nos da los campos con los nombres correctos
    ventas.value = await res.json()
  } catch (err) {
    console.error(err)
  }
})

// --- Filtrado de datos ---
const ventasFiltradas = computed(() => {
  return ventas.value.filter((v) => {
    const term = search.value.toLowerCase()

    // Búsqueda general
    const matchText =
      v.empleado.toLowerCase().includes(term) ||
      v.fecha_venta.includes(term) ||
      v.metodo_pago.toLowerCase().includes(term)

    // Filtros específicos
    const fechaOk =
      (!filtroFechaInicio.value || v.fecha_venta >= filtroFechaInicio.value) &&
      (!filtroFechaFin.value || v.fecha_venta <= filtroFechaFin.value)

    const empleadoOk =
      !filtroEmpleado.value || v.empleado.toLowerCase().includes(filtroEmpleado.value.toLowerCase())

    return matchText && fechaOk && empleadoOk
  })
})

// --- Total general (Se mantiene en lógica por si lo usas en el futuro, pero no se muestra) ---
const totalVentas = computed(() =>
  ventasFiltradas.value.reduce((acc, v) => acc + Number(v.monto_total), 0).toFixed(2),
)

// --- Exportar CSV ---
function exportarCSV() {
  const header = ['ID', 'Fecha', 'Hora', 'Empleado', 'Método de Pago', 'Monto Total (S/)']
  const rows = ventasFiltradas.value.map((v) => [
    v.venta_id,
    v.fecha_venta,
    v.hora_venta,
    v.empleado,
    v.metodo_pago,
    Number(v.monto_total).toFixed(2),
  ])
  const csvContent =
    'data:text/csv;charset=utf-8,' + [header, ...rows].map((e) => e.join(',')).join('\n')
  const link = document.createElement('a')
  link.setAttribute('href', encodeURI(csvContent))
  link.setAttribute('download', 'reporte_ventas.csv')
  link.click()
}
</script>

<template>
  <div class="sales-report-view">
    <div class="filters">
      <BaseButton variant="primary" @click="exportarCSV"> Exportar CSV </BaseButton>
    </div>

    <BaseTable
      :headers="[
        'ID',
        'Fecha',
        'Hora',
        'Empleado',
        'Método de Pago',
        'Monto Total (S/)',
        'Factura (PDF)',
      ]"
      :rows="ventasFiltradas"
      searchKey="empleado"
      :filters="[{ label: 'Método de Pago', options: ['Efectivo', 'Tarjeta', 'Yape', 'Plin'] }]"
    >
      <template #row="{ row }">
        <td>{{ row.venta_id }}</td>
        <td>{{ row.fecha_venta }}</td>
        <td>{{ row.hora_venta }}</td>
        <td>{{ row.empleado }}</td>
        <td>{{ row.metodo_pago }}</td>
        <td class="monto">S/ {{ Number(row.monto_total).toFixed(2) }}</td>
        <td>
          <BaseLink
            v-if="row.factura_url"
            :to="row.factura_url"
            external
            color="primary"
            label="Ver PDF"
          />
          <span v-else class="sin-factura">—</span>
        </td>
      </template>
    </BaseTable>
  </div>
</template>

<style scoped>
.sales-report-view {
  padding: 2rem 3rem;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}

.filters {
  display: flex;
  justify-content: end;
  width: 100%;
}

:deep(td a) {
  font-size: 0.75rem;
  text-decoration: none;
  color: var(--color-primary, #007bff);
}

:deep(td a:hover) {
  text-decoration: underline;
}

.sin-factura {
  color: #aaa;
  font-size: 0.8rem;
}
</style>
