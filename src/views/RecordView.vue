src/views/RecordView.vue
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue' // Agregamos onMounted
import BaseTable from '@/components/BaseTable.vue'
import BaseButton from '@/components/BaseButton.vue'
import AppIcon from '@/components/AppIcon.vue'

interface HistoryRecord {
  id: number
  fecha: string
  paciente: string
  producto: string
  medico: string
  cantidad: number
  estado: 'dispensada' | 'rechazada'
  motivo?: string
}

// Estado reactivo
const showDetailsModal = ref(false)
const selectedRecord = ref<HistoryRecord | null>(null)
const loading = ref(false) // Para estado de carga

// Datos de simulación (Usuario actual) - Esto se puede sacar del token luego
const currentUser = ref({ nombre: 'Farmacéutico Activo' })

// INICIALIZAMOS VACÍO (Se llenará desde el Backend)
const historyData = ref<HistoryRecord[]>([])

// Configuración de la tabla
const headers = ['Fecha', 'Paciente', 'Producto', 'Médico', 'Cantidad', 'Estado', 'Acciones']
const columnWidths = ['130px', '200px', '220px', '180px', '90px', '120px', '110px']

const tableFilters = [
  {
    label: 'Estado',
    options: ['Todos', 'Dispensada', 'Rechazada'],
  },
]

// Computed
const currentTime = computed(() => {
  return new Date().toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
})

// --- NUEVO: FUNCIÓN PARA OBTENER DATOS DEL BACKEND ---
const fetchHistorial = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    // Ajusta la URL si tu router usa prefijo /api/recetas
    const response = await fetch('http://localhost:3000/api/recetas/historial', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      historyData.value = data
    } else {
      console.error('Error cargando historial')
    }
  } catch (error) {
    console.error('Error de conexión:', error)
  } finally {
    loading.value = false
  }
}

// Métodos
const viewDetails = (record: HistoryRecord) => {
  selectedRecord.value = record
  showDetailsModal.value = true
}

const closeDetails = () => {
  showDetailsModal.value = false
  selectedRecord.value = null
}

// Exportar CSV
const exportCSV = () => {
  const csvHeaders = [
    'ID',
    'Fecha',
    'Paciente',
    'Producto',
    'Médico',
    'Cantidad',
    'Estado',
    'Motivo',
  ]
  const csvRows = historyData.value.map((r) => [
    r.id,
    r.fecha,
    r.paciente,
    r.producto,
    r.medico,
    r.cantidad,
    r.estado,
    r.motivo || '',
  ])

  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [csvHeaders, ...csvRows].map((e) => e.map((x) => `"${x}"`).join(',')).join('\n')

  const encodedUri = encodeURI(csvContent)
  const link = document.createElement('a')
  link.setAttribute('href', encodedUri)
  link.setAttribute('download', 'historial_dispensaciones.csv')
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Cargar datos al montar
onMounted(() => {
  fetchHistorial()
})
</script>

<template>
  <div class="history-view">
    <!-- Encabezado -->

    <div class="header-info">
      <BaseButton variant="primary" @click="exportCSV" width="160px" class="export">
        <AppIcon name="download" /> Exportar CSV
      </BaseButton>
    </div>

    <!-- Tabla de Historial -->
    <BaseTable :headers="headers" :rows="historyData" search-key="paciente" :filters="tableFilters">
      <template #row="{ row }">
        <td
          v-for="(header, colIndex) in headers"
          :key="colIndex"
          :style="{ width: columnWidths[colIndex] }"
        >
          <template v-if="header === 'Fecha'">{{ row.fecha }}</template>
          <template v-else-if="header === 'Paciente'">{{ row.paciente }}</template>
          <template v-else-if="header === 'Producto'">{{ row.producto }}</template>
          <template v-else-if="header === 'Médico'">{{ row.medico }}</template>
          <template v-else-if="header === 'Cantidad'">{{ row.cantidad }}</template>
          <template v-else-if="header === 'Estado'">
            <span class="status-badge" :class="row.estado">
              {{ row.estado === 'dispensada' ? ' Dispensada' : ' Rechazada' }}
            </span>
          </template>
          <template v-else-if="header === 'Acciones'">
            <div class="action-buttons">
              <BaseButton @click="viewDetails(row)" variant="secondary" class="btn-details">
                <AppIcon name="eye" /> Ver
              </BaseButton>
            </div>
          </template>
        </td>
      </template>
    </BaseTable>

    <!-- Modal de Detalles -->
    <div v-if="showDetailsModal" class="modal-overlay">
      <div class="modal">
        <h3>Detalles de Dispensación</h3>
        <div v-if="selectedRecord" class="record-details">
          <div class="detail-section">
            <h4>📋 Información General</h4>
            <div class="detail-grid">
              <div><strong>ID:</strong> #{{ selectedRecord.id }}</div>
              <div><strong>Fecha:</strong> {{ selectedRecord.fecha }}</div>
              <div>
                <strong>Estado:</strong>
                <span :class="selectedRecord.estado" class="status-text">
                  {{ selectedRecord.estado === 'dispensada' ? 'Dispensada' : 'Rechazada' }}
                </span>
              </div>
            </div>
          </div>

          <div class="detail-section">
            <h4>👤 Paciente</h4>
            <p><strong>Nombre:</strong> {{ selectedRecord.paciente }}</p>
          </div>

          <div class="detail-section">
            <h4>💊 Producto</h4>
            <p><strong>Medicamento:</strong> {{ selectedRecord.producto }}</p>
            <p><strong>Cantidad:</strong> {{ selectedRecord.cantidad }} unidades</p>
          </div>

          <div class="detail-section">
            <h4>👨‍⚕️ Médico</h4>
            <p><strong>Nombre:</strong> {{ selectedRecord.medico }}</p>
          </div>

          <div v-if="selectedRecord.motivo" class="detail-section">
            <h4>📝 Motivo de Rechazo</h4>
            <p class="rejection-reason">{{ selectedRecord.motivo }}</p>
          </div>
        </div>

        <div class="modal-actions">
          <BaseButton @click="closeDetails" variant="primary">Cerrar</BaseButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.history-view {
  padding: 2rem 3rem;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 0rem;
}

.header-info {
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: end;
}
.export {
  font-size: 0.8rem;
}

/* Tabla */
.status-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: bold;
}
.status-badge.dispensada {
  background: #d4edda;
  color: #155724;
}
.status-badge.rechazada {
  background: #f8d7da;
  color: #721c24;
}
.action-buttons {
  display: flex;
  gap: 5px;
}
.btn-details {
  padding: 3px 15px;
  font-size: 0.75rem;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}
.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}
.modal h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
  border-bottom: 2px solid #3498db;
  padding-bottom: 10px;
}
.record-details {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.detail-section {
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}
.detail-section h4 {
  margin: 0 0 10px 0;
  color: #3498db;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.status-text.dispensada {
  color: #27ae60;
  font-weight: bold;
}
.status-text.rechazada {
  color: #e74c3c;
  font-weight: bold;
}
.rejection-reason {
  background: #f8f9fa;
  padding: 10px;
  border-radius: 5px;
  border-left: 4px solid #e74c3c;
  font-style: italic;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}
</style>
