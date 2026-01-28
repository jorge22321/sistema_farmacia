<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'
// Importación de componentes
import BaseButton from '@/components/BaseButton.vue'
import TableSearch from '@/components/TableSearch.vue'
import Pagination from '@/components/TablePagination.vue'
import ProductCard from '@/components/ProductCard.vue'
import SaleItem from '@/components/SaleItem.vue'
import SaleSummary from '@/components/SaleSummary.vue'
import BaseModal from '@/components/BaseModal.vue'

// --- 1. INTERFACES ---
interface Category {
  categoria_id: number
  nombre: string
}

interface Product {
  producto_id: number
  nombre: string
  concentracion: string
  formato: string
  precio_venta: number
  requiere_receta: boolean
  stock_total: number
  laboratorio: string
  categoria: string
}

interface SaleItemType {
  producto_id: number
  nombre: string
  concentracion: string
  precio_venta: number
  cantidad: number
  numero_lote: string
  stock_disponible: number
  fecha_vencimiento: string
}

interface Sale {
  items: SaleItemType[]
}

// --- 2. ESTADO ---
const products = ref<Product[]>([])
const categories = ref<Category[]>([])
const searchTerm = ref('')
const currentSale = ref<Sale>({ items: [] })
const isLoading = ref(false)
const showPrescriptionModal = ref(false)
const showSuccessModal = ref(false)
const showPrescriptionWarningModal = ref(false)
const pendingProduct = ref<Product | null>(null)
const lastSaleId = ref(0)
const backupCargado = ref(false)

// Estado del pago (IDs numéricos)
const selectedPayment = ref(1)

// Paginación
const currentPage = ref(1)
const itemsPerPage = ref(9)

// Filtro Activo
const activeFilter = ref('all')

const paymentMethods = [
  { id: 1, label: '💵 Efectivo' },
  { id: 2, label: '💳 Tarjeta' },
  { id: 3, label: '📱 Yape' },
  { id: 4, label: '📱 Plin' },
]

watch(
  currentSale,
  (nuevoValor) => {
    // Solo guardamos si ya terminamos de cargar los datos iniciales
    if (backupCargado.value) {
      localStorage.setItem('carrito_temporal', JSON.stringify(nuevoValor))
    }
  },
  { deep: true }, // "deep" es vital para detectar cambios dentro de arrays/objetos
)
// --- 3. COMPUTADAS (SOLUCIÓN NaN 🛡️) ---

const subtotal = computed(() => {
  // 🛡️ Usamos reduce de forma segura. Si un valor falla, usamos 0.
  return currentSale.value.items.reduce((sum, item) => {
    const precio = Number(item.precio_venta) || 0
    const cantidad = Number(item.cantidad) || 0
    return sum + precio * cantidad
  }, 0)
})

const igv = computed(() => {
  const s = Number(subtotal.value) || 0
  return s * 0.18
})

const total = computed(() => {
  const s = Number(subtotal.value) || 0
  const i = Number(igv.value) || 0
  return s + i
})

const filteredProducts = computed(() => {
  let temp = products.value

  // Filtro Texto
  if (searchTerm.value) {
    const q = searchTerm.value.toLowerCase()
    temp = temp.filter(
      (p) => p.nombre.toLowerCase().includes(q) || p.laboratorio.toLowerCase().includes(q),
    )
  }

  // Filtro Categoría
  if (activeFilter.value !== 'all') {
    temp = temp.filter((p) => p.categoria === activeFilter.value)
  }
  return temp
})

const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value))
const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage.value
  return filteredProducts.value.slice(start, start + itemsPerPage.value)
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() =>
  Math.min(startIndex.value + itemsPerPage.value, filteredProducts.value.length),
)

// --- 4. MÉTODOS ---

const loadCategories = async () => {
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get('http://localhost:3000/api/categorias', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (Array.isArray(data) && data.length > 0) {
      categories.value = data
    } else {
      categories.value = []
    }
  } catch (error) {
    console.warn('No se pudieron cargar categorías.', error)
    categories.value = []
  }
}

// 🛡️ CARGAR PRODUCTOS MEJORADO (Aquí eliminamos la causa raíz del NaN)
const loadProducts = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get('http://localhost:3000/api/productos', {
      headers: { Authorization: `Bearer ${token}` },
    })

    // 1. DEBUG: Ver qué llega realmente (Míralo en la consola con F12)
    if (data.length > 0) {
      console.log('🔍 Ejemplo dato crudo del backend:', data[0])
      console.log('💰 Precio crudo:', data[0].precio_venta, 'Tipo:', typeof data[0].precio_venta)
    }

    products.value = data.map((p: any) => {
      // 2. LIMPIEZA DE PRECIO INTELIGENTE
      let precioLimpio = p.precio_venta

      // Si viene como texto (ej: "12,50" o "S/ 12.50"), lo limpiamos
      if (typeof precioLimpio === 'string') {
        // Quitamos cualquier símbolo de moneda (S/, $, etc) si existiera
        precioLimpio = precioLimpio.replace(/[^\d.,-]/g, '')
        // Reemplazamos coma por punto para que JS entienda (10,50 -> 10.50)
        precioLimpio = precioLimpio.replace(',', '.')
      }

      return {
        ...p,
        requiere_receta: Boolean(p.requiere_receta),
        // Convertimos a número. Si falla, ahora sí será 0, pero ya limpiamos el dato antes.
        precio_venta: Number(precioLimpio) || 0,
        stock_total: Number(p.stock_total || 0),
      }
    })
  } catch (error) {
    console.error('Error cargando productos:', error)
  } finally {
    isLoading.value = false
  }
}

const handleCloseWarning = () => {
  // Cierra el modal
  showPrescriptionWarningModal.value = false

  // OPCIÓN A: Si "Cerrar" significa "Cancelar / No agregar":
  pendingProduct.value = null

  // OPCIÓN B: Si "Cerrar" significa "Ya vi la receta, agrégalo":
  // if (pendingProduct.value) {
  //   addProductToCart(pendingProduct.value)
  //   pendingProduct.value = null
  // }
}
const addToSale = (product: Product) => {
  if (product.requiere_receta) {
    pendingProduct.value = product
    showPrescriptionWarningModal.value = true
    return
  }
  addProductToCart(product)
}

const addProductToCart = (product: Product) => {
  const existingItem = currentSale.value.items.find((i) => i.producto_id === product.producto_id)

  if (existingItem) {
    if (existingItem.cantidad < product.stock_total) {
      existingItem.cantidad++
    } else {
      alert('Stock máximo alcanzado para este producto')
    }
  } else {
    // 🛡️ Al agregar, nos aseguramos que precio_venta sea un número válido
    currentSale.value.items.push({
      producto_id: product.producto_id,
      nombre: product.nombre,
      concentracion: product.concentracion,
      precio_venta: Number(product.precio_venta) || 0,
      cantidad: 1,
      numero_lote: 'AUTO',
      stock_disponible: product.stock_total,
      fecha_vencimiento: '---',
    })
  }
}

const goToDispenserFromWarning = () => {
  showPrescriptionWarningModal.value = false
  if (pendingProduct.value) {
    addProductToCart(pendingProduct.value)
    pendingProduct.value = null
  }
}

const updateQuantity = (index: number, newQty: number) => {
  const item = currentSale.value.items[index]
  if (item && newQty > 0) {
    if (newQty <= item.stock_disponible) {
      item.cantidad = Number(newQty) // 🛡️ Asegurar que sea número
    } else {
      alert('No hay suficiente stock')
    }
  }
}

const removeItem = (index: number) => {
  currentSale.value.items.splice(index, 1)
}

const clearSale = () => {
  currentSale.value.items = []
  selectedPayment.value = 1
  searchTerm.value = ''
  currentPage.value = 1
  focusSearch()
}

const processSale = async () => {
  if (currentSale.value.items.length === 0) return

  // 🛡️ Validación final antes de enviar
  if (isNaN(total.value) || total.value <= 0) {
    alert('Error en el cálculo del total. Verifica los precios de los productos.')
    return
  }

  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const payload = {
      items: currentSale.value.items,
      metodo_id: selectedPayment.value,
      total: Number(total.value.toFixed(2)), // Enviar número limpio con 2 decimales
    }

    console.log(' Enviando:', payload)

    const { data } = await axios.post('http://localhost:3000/api/ventas', payload, {
      headers: { Authorization: `Bearer ${token}` },
    })

    lastSaleId.value = data.venta_id || 0
    showSuccessModal.value = true
    loadProducts()
  } catch (error: any) {
    console.error('Error procesando venta:', error)
    const msg = error.response?.data?.message || 'Error al procesar la venta'
    alert(msg)
  } finally {
    isLoading.value = false
  }
}

const closeSuccessModal = () => {
  showSuccessModal.value = false
  clearSale()
}

const focusSearch = () => {
  setTimeout(() => {
    const input = document.querySelector('.table-search input') as HTMLInputElement
    input?.focus()
  }, 100)
}

const applyQuickFilter = (filterName: string) => {
  activeFilter.value = filterName
  searchTerm.value = ''
  currentPage.value = 1
}

onMounted(async () => {
  await loadCategories()
  await loadProducts()
  focusSearch()

  // 2. RECUPERAR CARRITO (Si vienes de otra pestaña)
  const carritoGuardado = localStorage.getItem('carrito_temporal')
  if (carritoGuardado) {
    try {
      // Restauramos el carrito tal cual estaba
      currentSale.value = JSON.parse(carritoGuardado)
    } catch (e) {
      console.error('Error recuperando carrito temporal', e)
    }
  }

  // Marcamos que ya cargamos el backup para activar el watcher
  backupCargado.value = true

  // 3. RECIBIR DESDE DISPENSADOR (Tu lógica anterior)
  const dispensado = localStorage.getItem('producto_dispensado')

  if (dispensado) {
    try {
      const item = JSON.parse(dispensado)
      const productoEncontrado = products.value.find((p) => p.producto_id === item.producto_id)

      if (productoEncontrado) {
        // Usamos tu función existente para agregar
        addProductToCart(productoEncontrado)

        // Ajustamos cantidad si es necesario
        // (Asegúrate de buscar el item recién agregado al final del array o por ID)
        const itemEnCarrito = currentSale.value.items.find(
          (i) => i.producto_id === item.producto_id,
        )
        if (itemEnCarrito) {
          // Si la receta pedía 3, y el addProduct puso 1, actualizamos
          // PERO cuidado de no sumar si ya estaba en el carrito recuperado
          // Por simplicidad, aquí forzamos la cantidad si acaba de llegar
          itemEnCarrito.cantidad = item.cantidad
        }
      }
    } catch (e) {
      console.error('Error procesando receta', e)
    } finally {
      localStorage.removeItem('producto_dispensado')
    }
  }
})
</script>

<template>
  <div class="point-of-sale">
    <div class="pos-layout">
      <div class="left-panel">
        <div class="search-section">
          <TableSearch
            v-model="searchTerm"
            @update:modelValue="currentPage = 1"
            placeholder="Buscar producto por nombre..."
          />
          <BaseButton @click="focusSearch" class="btn-focus">⌕</BaseButton>
        </div>

        <div class="quick-filters">
          <BaseButton
            @click="applyQuickFilter('all')"
            :variant="activeFilter === 'all' ? 'primary' : 'main'"
            bordered
            class="filter-btn"
          >
            Todos
          </BaseButton>

          <BaseButton
            v-for="cat in categories"
            :key="cat.categoria_id"
            @click="applyQuickFilter(cat.nombre)"
            :variant="activeFilter === cat.nombre ? 'primary' : 'main'"
            bordered
            class="filter-btn"
          >
            {{ cat.nombre }}
          </BaseButton>
        </div>

        <div class="results-info">
          <span v-if="!isLoading"
            >Mostrando {{ filteredProducts.length > 0 ? startIndex + 1 : 0 }}-{{ endIndex }} de
            {{ filteredProducts.length }} productos</span
          >
          <span v-else>Cargando inventario...</span>
        </div>

        <div class="search-results">
          <template v-if="!isLoading">
            <ProductCard
              v-for="product in paginatedResults"
              :key="product.producto_id"
              :product="product"
              @select="addToSale"
            />
            <div v-if="paginatedResults.length === 0" class="no-results">
              No se encontraron productos
              {{ activeFilter !== 'all' ? `en categoría "${activeFilter}"` : '' }}
            </div>
          </template>
        </div>

        <Pagination
          v-if="filteredProducts.length > 0"
          v-model="currentPage"
          :total-pages="totalPages"
          :per-page="itemsPerPage"
          @update:perPage="itemsPerPage = $event"
        />

        <div class="prescription-action">
          <BaseButton variant="primary" full>Atender Receta </BaseButton>
        </div>
      </div>

      <div class="right-panel">
        <div class="cart-header">
          <h4>
            Venta Actual <span class="badge">({{ currentSale.items.length }})</span>
          </h4>
        </div>

        <div class="sale-items">
          <SaleItem
            v-for="(item, index) in currentSale.items"
            :key="index"
            :item="item"
            :index="index"
            @update-quantity="updateQuantity"
            @remove="removeItem"
          />

          <div v-if="currentSale.items.length === 0" class="empty-cart">
            <div class="empty-icon">🛒</div>
            <p>Carrito vacío</p>
          </div>
        </div>

        <SaleSummary
          :subtotal="subtotal"
          :total="total"
          :selected-payment="selectedPayment"
          :payment-methods="paymentMethods"
          @checkout="processSale"
          @clear-sale="clearSale"
          @update-payment="selectedPayment = $event"
        />
      </div>
    </div>

    <div v-if="showPrescriptionWarningModal" class="modal-overlay">
      <BaseModal
        :show="showPrescriptionWarningModal"
        title=""
        @close="showPrescriptionWarningModal = false"
      >
        <div class="prescription-warning-content">
          <div class="icon-container">
            <div class="icon-circle">💊</div>
          </div>

          <h3 class="warning-title">Producto Controlado</h3>

          <div class="warning-message">
            <p>
              El producto
              <span class="highlight-product">{{ pendingProduct?.nombre }}</span> requiere
              presentación de receta médica obligatoria.
            </p>
            <p class="sub-text">Verifique el documento físico antes de entregar.</p>
          </div>

          <div class="modal-actions-single">
            <BaseButton @click="handleCloseWarning" variant="main" full class="btn-close-modal">
              Cerrar
            </BaseButton>
          </div>
        </div>
      </BaseModal>

      <BaseModal :show="showSuccessModal" title="✅ Venta Exitosa" @close="closeSuccessModal">
        <div class="success-content">
          <div class="success-icon-large">🎉</div>
          <p class="transaction-id">Transacción #{{ lastSaleId }}</p>
          <p class="total-amount">
            Monto Total: <strong>S/ {{ total.toFixed(2) }}</strong>
          </p>

          <div class="modal-actions">
            <BaseButton @click="closeSuccessModal" variant="primary" full> Nueva Venta </BaseButton>
          </div>
        </div>
      </BaseModal>
    </div>

    <div v-if="showSuccessModal" class="modal-overlay">
      <div class="modal success-modal">
        <div class="success-icon">✅</div>
        <h3>Venta Exitosa</h3>
        <p>Transacción #{{ lastSaleId }}</p>
        <p>Monto: S/ {{ total.toFixed(2) }}</p>
        <BaseButton @click="closeSuccessModal" variant="primary" full>Nueva Venta</BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.point-of-sale {
  height: auto;
  display: flex;
  flex-direction: column;
}

.sale-info {
  display: flex;
  gap: 20px;
  font-size: 14px;
  color: #666;
}

.pos-layout {
  display: flex;
  flex: 1;
  gap: 10px;
  padding: 10px;

  height: calc(100vh - 80px);
}
h4 {
  margin: 8px 0 8px 0;
}
.left-panel {
  flex: 1;
  background: white;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid #eee;
}

.right-panel {
  width: 400px;
  background: white;
  border-radius: 8px;
  border: 1px solid #eee;
  padding: 0px 10px;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.search-section {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.search-input {
  flex: 1;
}

.quick-filters {
  display: flex;
  gap: 8px;
  margin-bottom: 5px;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 6px 12px 6px 7px;
  border-radius: 20px;
  font-size: 12px;
}

.results-info {
  padding: 5px 0;
  font-size: 12px;
  color: #666;
  text-align: center;
  margin-bottom: 10px;
}

.search-results {
  flex: 1;
  overflow-y: auto;
  max-height: 280px;
  min-height: 280px;
  padding-top: 1px;
}

.no-results {
  text-align: center;
  padding: 40px;
  color: #7f8c8d;
  font-style: italic;
}

.prescription-action {
  margin-top: 15px;
}

.btn-prescription {
  padding: 10px;
}

.sale-items {
  flex: 1;
  margin-bottom: 10px;
  overflow-y: auto;
  max-height: 230px;
}

.item-count {
  background: #3498db;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 10px;
}

.empty-cart {
  text-align: center;
  color: #7f8c8d;
  padding: 80px 0 20px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
  opacity: 0.5;
}

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
  min-width: 400px;
  max-width: 500px;
  width: 90%;
}

.modal h3 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.prescription-check {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 5px;
}

.prescription-check label {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
}

.prescription-options {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-validate,
.btn-cancel {
  padding: 12px 20px;
}

.success-modal {
  text-align: center;
}

.success-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.sale-details {
  text-align: left;
  background: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin: 15px 0;
}

.sale-details p {
  margin: 8px 0;
}

.btn-confirm {
  padding: 15px;
  margin-top: 15px;
}

/* 📍 Agrega estos estilos en tu sección de estilos */

.warning-modal {
  text-align: center;
  max-width: 500px;
}

.warning-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.warning-content {
  text-align: center;

  border-radius: 5px;
}

.warning-text {
  color: #856404;
  background: #fff3cd;
  padding: 10px;
  border-radius: 4px;
  margin-top: 10px;
  font-size: 0.9rem;
}

.warning-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 5px 0;
  align-items: center;
}

.warning-actions .base-button {
  padding: 12px;
  justify-content: center;
}

.btn-go-to-dispenser {
  background: linear-gradient(135deg, #007bff, #0056b3);
  color: white;
}

.btn-validate-here {
  background: linear-gradient(135deg, #28a745, #218838);
  color: white;
}

.warning-note {
  margin-top: 15px;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 5px;
  font-size: 0.8rem;
  color: #6c757d;
}

.prescription-warning-content {
  text-align: center;
  padding: 10px 20px 20px 20px;
  color: #2c3e50;
}

.icon-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.icon-circle {
  width: 80px;
  height: 80px;
  background-color: #fff3cd; /* Fondo amarillo suave */
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  box-shadow: 0 4px 10px rgba(255, 243, 205, 0.5);
  animation: popIn 0.3s ease-out;
}

.warning-title {
  margin: 0 0 15px 0;
  font-size: 1.5rem;
  font-weight: 700;
  color: #856404; /* Texto mostaza oscuro */
}

.warning-message {
  margin-bottom: 30px;
  font-size: 1rem;
  line-height: 1.5;
  color: #555;
}

.highlight-product {
  font-weight: bold;
  color: #2c3e50;
  padding: 2px 6px;
}

.sub-text {
  margin-top: 12px;
  font-size: 0.9rem;
  color: #888;
}

.modal-actions-single {
  display: flex;
  justify-content: center;
}

.btn-close-modal {
  padding: 12px 0;
  font-size: 1rem;
  background-color: #e2e6ea;
  color: #495057;
  border: 1px solid #ced4da;
}

.btn-close-modal:hover {
  background-color: #dbe2e8;
  color: #212529;
}

/* Pequeña animación para el icono */
@keyframes popIn {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  80% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
