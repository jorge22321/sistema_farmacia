src/views/ProductControlView.vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router' // Importamos router para redireccionar si falla el token
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import BaseButton from '@/components/BaseButton.vue'
import BaseCheckbox from '@/components/BaseCheckbox.vue'

// --- Interfaces (Coinciden con tu DB) ---
interface Categoria {
  categoria_id: number
  nombre: string
}

interface Laboratorio {
  laboratorio_id: number
  nombre: string
}

interface Ubicacion {
  ubicacion_id: number
  nombre: string
}

interface ProductoForm {
  producto_id: string | number // Puede ser string al escribir, number al venir de DB
  nombre: string
  concentracion: string
  formato: string
  categoria_id: number | ''
  laboratorio_id: number | ''
  ubicacion_id: number | ''
  requiere_receta: boolean
}

// --- Estado ---
const router = useRouter()
const form = ref<ProductoForm>({
  producto_id: '',
  nombre: '',
  concentracion: '',
  formato: '',
  categoria_id: '',
  laboratorio_id: '',
  ubicacion_id: '',
  requiere_receta: false,
})

const categorias = ref<Categoria[]>([])
const laboratorios = ref<Laboratorio[]>([])
const ubicaciones = ref<Ubicacion[]>([])
const productoEncontrado = ref(false)

// --- Helper: Obtener Headers con Token ---
function getAuthHeaders() {
  const token = localStorage.getItem('token') // O donde hayas guardado el token al hacer Login
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // <--- CLAVE: Enviamos el token
  }
}

// --- Helper: Manejar errores de autenticación ---
function handleAuthError(status: number) {
  if (status === 401 || status === 403) {
    alert('⚠️ Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
    router.push('/login') // Redirige al login (asegúrate de tener esta ruta)
    return true
  }
  return false
}

// ✅ 1. Cargar listas auxiliares (Categorías, etc.)
onMounted(async () => {
  try {
    // Usamos Promise.all para cargar todo en paralelo
    const [resCat, resLab, resUbi] = await Promise.all([
      fetch('/api/categorias', { headers: getAuthHeaders() }),
      fetch('/api/laboratorios', { headers: getAuthHeaders() }),
      fetch('/api/ubicaciones', { headers: getAuthHeaders() }),
    ])

    if (handleAuthError(resCat.status)) return

    if (resCat.ok) categorias.value = await resCat.json()
    if (resLab.ok) laboratorios.value = await resLab.json()
    if (resUbi.ok) ubicaciones.value = await resUbi.json()
  } catch (err) {
    console.error('Error cargando listas:', err)
  }
})

// ✅ 2. Buscar producto por código (ID)
async function buscarProducto() {
  if (!form.value.producto_id) return alert('Por favor ingresa un código de producto.')

  try {
    const res = await fetch(`/api/productos/${form.value.producto_id}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    })

    if (handleAuthError(res.status)) return

    if (res.ok) {
      const data = await res.json()
      form.value = { ...data } // Rellenamos el formulario
      productoEncontrado.value = true
      alert('✅ Producto encontrado. Puedes modificarlo o eliminarlo.')
    } else {
      productoEncontrado.value = false
      alert(
        'ℹ️ No se encontró un producto con ese ID. Puedes usar el formulario para crear uno nuevo (El ID será automático).',
      )
      // No limpiamos todo, dejamos el ID por si el usuario se equivocó
      limpiarFormulario(false)
    }
  } catch (err) {
    console.error(err)
    alert('❌ Error de conexión al buscar producto.')
  }
}

// ✅ 3. Guardar o actualizar producto
async function guardarProducto() {
  if (!form.value.nombre || !form.value.categoria_id)
    return alert('Por favor completa los campos obligatorios (*).')

  // Lógica: Si ya lo encontramos, es PUT (Actualizar). Si no, es POST (Crear).
  const metodo = productoEncontrado.value ? 'PUT' : 'POST'

  // URL: Si es PUT usamos el ID. Si es POST, usamos la raíz (el backend genera el ID)
  const url = productoEncontrado.value
    ? `/api/productos/${form.value.producto_id}`
    : '/api/productos'

  try {
    const res = await fetch(url, {
      method: metodo,
      headers: getAuthHeaders(),
      body: JSON.stringify(form.value),
    })

    if (handleAuthError(res.status)) return

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Error en el guardado.')
    }

    const data = await res.json()

    alert(
      productoEncontrado.value
        ? '✅ Producto actualizado correctamente.'
        : `✅ Producto registrado exitosamente. Nuevo ID: ${data.producto_id || 'Creado'}`,
    )

    limpiarFormulario()
  } catch (err: any) {
    console.error(err)
    alert(`❌ Error: ${err.message}`)
  }
}

// ✅ 4. Eliminar producto
async function eliminarProducto() {
  if (!productoEncontrado.value) return alert('Primero busca un producto existente.')
  if (!confirm('¿Seguro que deseas eliminar este producto permanentemente?')) return

  try {
    const res = await fetch(`/api/productos/${form.value.producto_id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })

    if (handleAuthError(res.status)) return

    if (!res.ok) {
      const errorData = await res.json()
      throw new Error(errorData.message || 'Error al eliminar')
    }

    alert('🗑️ Producto eliminado correctamente.')
    limpiarFormulario()
  } catch (err: any) {
    console.error(err)
    alert(`❌ No se pudo eliminar: ${err.message}`)
  }
}

// ✅ Limpiar formulario
function limpiarFormulario(borrarId = true) {
  const idActual = form.value.producto_id
  form.value = {
    producto_id: borrarId ? '' : idActual,
    nombre: '',
    concentracion: '',
    formato: '',
    categoria_id: '',
    laboratorio_id: '',
    ubicacion_id: '',
    requiere_receta: false,
  }
  productoEncontrado.value = false
}
</script>

<template>
  <div class="product-control-container">
    <form @submit.prevent="guardarProducto" class="product-form">
      <!-- Sección de Búsqueda -->
      <div class="form-section">
        <div class="id-search-group">
          <BaseInput
            label="Código del Producto"
            v-model="form.producto_id"
            placeholder="Ej. P001"
          />
          <BaseButton type="button" variant="secondary" @click="buscarProducto">
            Buscar
          </BaseButton>
        </div>
      </div>

      <!-- Sección de Información del Producto -->
      <div class="form-section">
        <div class="form-grid">
          <BaseInput
            label="Nombre del Producto *"
            v-model="form.nombre"
            required
            class="full-width"
          />

          <BaseInput
            label="Concentración"
            v-model="form.concentracion"
            placeholder="Ej. 500mg, 10ml"
          />

          <BaseInput label="Formato" v-model="form.formato" placeholder="Ej. Tableta, Jarabe" />
        </div>
      </div>

      <!-- Sección de Categorización -->
      <div class="form-section">
        <div class="form-grid">
          <BaseSelect
            label="Categoría *"
            v-model="form.categoria_id"
            :options="categorias.map((c) => ({ value: c.categoria_id, text: c.nombre }))"
            required
          />

          <BaseSelect
            label="Laboratorio"
            v-model="form.laboratorio_id"
            :options="laboratorios.map((l) => ({ value: l.laboratorio_id, text: l.nombre }))"
          />

          <BaseSelect
            label="Ubicación"
            v-model="form.ubicacion_id"
            :options="ubicaciones.map((u) => ({ value: u.ubicacion_id, text: u.nombre }))"
          />
        </div>
      </div>

      <!-- Sección de Configuración -->
      <div class="form-section">
        <BaseCheckbox label="Requiere receta médica" v-model="form.requiere_receta" />
      </div>

      <!-- Botones de Acción -->
      <div class="form-actions">
        <BaseButton type="submit" variant="primary" class="action-btn">
          {{ productoEncontrado ? 'Actualizar Producto' : 'Guardar Producto' }}
        </BaseButton>

        <div class="secondary-actions">
          <BaseButton
            type="button"
            variant="danger"
            @click="eliminarProducto"
            v-if="productoEncontrado"
            class="action-btn"
          >
            Eliminar
          </BaseButton>

          <BaseButton
            type="button"
            variant="warning"
            @click="limpiarFormulario()"
            class="action-btn"
          >
            Limpiar
          </BaseButton>
        </div>
      </div>
    </form>
  </div>
</template>

<style scoped>
.product-control-container {
  height: auto;
  padding: 2rem 3rem;
  background: #fff;
  overflow-y: auto;
}

.product-form {
  max-width: 800px;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.id-search-group {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 0.75rem;
  align-items: end;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.full-width {
  grid-column: 1 / -1;
}

.form-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.secondary-actions {
  display: flex;
  gap: 2rem;
}

.action-btn {
  min-width: 120px;
}

/* Ajustes de tamaño de componentes */
.product-control-container :deep(.input-group),
.product-control-container :deep(.select-group),
.product-control-container :deep(.checkbox-group) {
  margin-bottom: 0;
}

.product-control-container :deep(input),
.product-control-container :deep(select) {
  font-size: 0.7rem;
}

.product-control-container :deep(label) {
  font-size: 0.75rem;
  font-weight: 600;
}

.product-control-container :deep(button) {
  font-size: 0.7rem;
}
</style>
