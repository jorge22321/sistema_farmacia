<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import axios from 'axios' // ✅ Importamos axios
import Card from '@/components/Card.vue'
import TableSearch from '@/components/TableSearch.vue'
import ProductCard from '@/components/InventoryProductCard.vue'

type EstadoStock = 'criticos' | 'bajos' | 'normales' | 'todos'

interface ProductoStock {
  producto_id: number
  nombre: string
  concentracion: string
  formato: string
  categoria: { id: number; nombre: string }
  laboratorio: { id: number; nombre: string }
  stock_actual: number
  stock_minimo: number
  lote_proximo_vencer: { numero_lote: string; fecha_vencimiento: string; cantidad: number } | null
}

// 🎯 ESTADO GLOBAL
const pedidosPendientes = ref<
  Array<{
    producto: ProductoStock
    cantidad_sugerida: number
    fecha_solicitud: string
  }>
>([])

const productosCriticos = ref<ProductoStock[]>([])
const productosBajos = ref<ProductoStock[]>([])
const productosNormales = ref<ProductoStock[]>([])
const estadoSeleccionado = ref<EstadoStock>('todos')
const filtroBusqueda = ref('')
const isLoading = ref(true)

// 🔔 Notificación
const mostrarNotificacion = ref(false)
const productoAgregado = ref<string>('')

// ✅ FUNCION DE CARGA REAL CON AXIOS
const cargarStock = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await axios.get('http://localhost:3000/api/stock/control', {
      headers: { Authorization: `Bearer ${token}` },
    })

    // 🔍 DEBUG: Mira esto en la consola del navegador (F12 -> Console)
    console.log('📦 Datos recibidos del Backend:', response.data)

    const data = response.data

    // ✅ VALIDACIÓN EXTRICTA:
    // Solo asignamos si existe Y es un array. Si no, ponemos [].
    productosCriticos.value = Array.isArray(data?.criticos) ? data.criticos : []
    productosBajos.value = Array.isArray(data?.bajos) ? data.bajos : []
    productosNormales.value = Array.isArray(data?.normales) ? data.normales : []
  } catch (error) {
    console.error('❌ Error cargando control de stock:', error)
    // En caso de error, aseguramos arrays vacíos para que la pantalla no se rompa
    productosCriticos.value = []
    productosBajos.value = []
    productosNormales.value = []
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  cargarStock() // ✅ Llamada a la API real
})

// 🧮 Total general
const totalProductos = computed(
  () =>
    productosCriticos.value.length + productosBajos.value.length + productosNormales.value.length,
)

// 📦 Pedidos pendientes count
const totalPedidosPendientes = computed(() => pedidosPendientes.value.length)

// 🔍 Filtrado por estado + búsqueda
const productosFiltrados = computed(() => {
  let lista: { producto: ProductoStock; estado: Exclude<EstadoStock, 'todos'> }[] = []

  if (estadoSeleccionado.value === 'todos') {
    lista = [
      ...productosCriticos.value.map((p) => ({ producto: p, estado: 'criticos' as const })),
      ...productosBajos.value.map((p) => ({ producto: p, estado: 'bajos' as const })),
      ...productosNormales.value.map((p) => ({ producto: p, estado: 'normales' as const })),
    ]
  } else if (estadoSeleccionado.value === 'criticos') {
    lista = productosCriticos.value.map((p) => ({ producto: p, estado: 'criticos' as const }))
  } else if (estadoSeleccionado.value === 'bajos') {
    lista = productosBajos.value.map((p) => ({ producto: p, estado: 'bajos' as const }))
  } else {
    lista = productosNormales.value.map((p) => ({ producto: p, estado: 'normales' as const }))
  }

  // filtro de búsqueda
  if (filtroBusqueda.value.length > 2) {
    const term = filtroBusqueda.value.toLowerCase()
    return lista.filter(
      (p) =>
        p.producto.nombre.toLowerCase().includes(term) ||
        p.producto.categoria.nombre.toLowerCase().includes(term) ||
        p.producto.laboratorio.nombre.toLowerCase().includes(term),
    )
  }

  return lista
})

function seleccionarEstado(estado: EstadoStock) {
  estadoSeleccionado.value = estado
  filtroBusqueda.value = ''
}

// 🎯 Generar Pedido (Mantenemos la lógica local que pediste)
function generarPedido(producto: ProductoStock) {
  const cantidadSugerida = Math.max(
    producto.stock_minimo * 2,
    producto.stock_minimo - producto.stock_actual + 10,
  )

  const yaExiste = pedidosPendientes.value.find(
    (p) => p.producto.producto_id === producto.producto_id,
  )

  if (!yaExiste) {
    pedidosPendientes.value.push({
      producto: producto,
      cantidad_sugerida: cantidadSugerida,
      fecha_solicitud: new Date().toLocaleDateString('es-ES'),
    })

    productoAgregado.value = producto.nombre
    mostrarNotificacion.value = true

    setTimeout(() => {
      mostrarNotificacion.value = false
    }, 3000)
  } else {
    productoAgregado.value = `${producto.nombre} (ya en lista)`
    mostrarNotificacion.value = true
    setTimeout(() => {
      mostrarNotificacion.value = false
    }, 2000)
  }
}

defineExpose({
  pedidosPendientes,
  limpiarPedidos: () => {
    pedidosPendientes.value = []
  },
})
</script>

<template>
  <div class="stock-low-view">
    <div v-if="mostrarNotificacion" class="notification-overlay">
      <div class="notification-card">
        <div class="notification-icon">✅</div>
        <div class="notification-content">
          <strong>{{ productoAgregado }}</strong>
          <span>agregado a pedidos pendientes</span>
        </div>
        <button @click="mostrarNotificacion = false" class="btn-cerrar-notif">×</button>
      </div>
    </div>

    <div class="header-section">
      <div class="pedidos-badge" v-if="totalPedidosPendientes > 0">
        <span class="badge-count">{{ totalPedidosPendientes }}</span>
        <span>Pedidos pendientes</span>
        <router-link to="/laboratorios" class="ver-pedidos-btn">
          Ver en Laboratorios →
        </router-link>
      </div>
    </div>

    <div class="summary-cards">
      <Card
        title="Agotados"
        :value="productosCriticos.length"
        icon="ph-x-circle"
        color="#dc3545"
        :class="{ active: estadoSeleccionado === 'criticos' }"
        @click="seleccionarEstado('criticos')"
      />
      <Card
        title="Stock Bajo"
        :value="productosBajos.length"
        icon="ph-warning-circle"
        color="#ffc107"
        :class="{ active: estadoSeleccionado === 'bajos' }"
        @click="seleccionarEstado('bajos')"
      />
      <Card
        title="Stock Normal"
        :value="productosNormales.length"
        icon="ph-check-circle"
        color="#28a745"
        :class="{ active: estadoSeleccionado === 'normales' }"
        @click="seleccionarEstado('normales')"
      />
      <Card
        title="Stock Total"
        :value="totalProductos"
        icon="ph-box"
        color="#007bff"
        :class="{ active: estadoSeleccionado === 'todos' }"
        @click="seleccionarEstado('todos')"
      />
    </div>

    <div class="actions-bar">
      <TableSearch
        v-model="filtroBusqueda"
        placeholder="Buscar producto, categoría o laboratorio..."
      />
    </div>

    <div class="card-list-container">
      <div v-if="isLoading" class="loading">Cargando reporte de stock...</div>
      <div v-else-if="productosFiltrados.length === 0" class="loading">
        No hay productos en esta categoría.
      </div>
      <div v-else class="card-grid">
        <ProductCard
          v-for="item in productosFiltrados"
          :key="item.producto.producto_id"
          :producto="item.producto"
          :estado="item.estado"
          @generarPedido="generarPedido"
        />
      </div>
    </div>
  </div>
</template>
<style scoped>
.stock-low-view {
  padding: 2rem 3rem 2rem 3rem;
  background: #fff;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  position: relative;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.header-section h1 {
  color: #2c3e50;
  margin: 0;
  font-size: 1.5rem;
}

.pedidos-badge {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #e7f3ff;
  border: 2px solid #007bff;
  border-radius: 8px;
  font-size: 0.9rem;
}

.badge-count {
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 50%;
  font-size: 0.8rem;
  font-weight: bold;
  min-width: 20px;
  text-align: center;
}

.ver-pedidos-btn {
  color: #007bff;
  text-decoration: none;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  transition: background 0.2s;
}

.ver-pedidos-btn:hover {
  background: #007bff;
  color: white;
}

/* 🔔 Notificación */
.notification-overlay {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.notification-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: white;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #28a745;
  min-width: 300px;
}

.notification-icon {
  font-size: 1.5rem;
}

.notification-content {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.notification-content strong {
  color: #2c3e50;
  font-size: 0.95rem;
}

.notification-content span {
  color: #6c757d;
  font-size: 0.85rem;
}

.btn-cerrar-notif {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #6c757d;
  padding: 0.25rem;
  border-radius: 4px;
}

.btn-cerrar-notif:hover {
  background: #f8f9fa;
  color: #495057;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Las cards de resumen ahora usan todo el ancho de forma responsive */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.actions-bar {
  background: #fff;
  border-radius: 10px;
  padding: 0.2rem;
}

.card-list-container {
  background: #fff;
  border-radius: 10px;
  padding: 0.5rem;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #777;
}

/* Responsive */
@media (max-width: 768px) {
  .stock-low-view {
    padding: 1rem;
  }

  .header-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .pedidos-badge {
    justify-content: space-between;
  }

  .summary-cards {
    grid-template-columns: 1fr 1fr;
  }

  .notification-card {
    min-width: auto;
    margin: 0 1rem;
  }
}
</style>
