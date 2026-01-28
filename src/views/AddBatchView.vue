<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router' // Importamos router para redireccionar si falla el login
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import BaseDate from '@/components/BaseDate.vue'
import BaseButton from '@/components/BaseButton.vue'

interface Producto {
  producto_id: number
  nombre: string
}

interface LoteForm {
  producto_id: number | ''
  numero_lote: string
  fecha_vencimiento: string
  cantidad_stock: number
  precio_costo: number
  precio_venta: number
}

const router = useRouter() // Instancia del router
const form = ref<LoteForm>({
  producto_id: '',
  numero_lote: '',
  fecha_vencimiento: '',
  cantidad_stock: 0,
  precio_costo: 0,
  precio_venta: 0,
})

const productos = ref<Producto[]>([])

// --- Función auxiliar para enviar el Token ---
function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// --- Cargar Productos al montar ---
onMounted(async () => {
  try {
    const res = await fetch('/api/productos', {
      headers: getAuthHeaders(), // Agregamos headers con token
    })

    // Si el token venció (401), mandar al login
    if (res.status === 401) {
      alert('Sesión expirada')
      return router.push('/login')
    }

    if (!res.ok) throw new Error('Error al obtener productos')
    productos.value = await res.json()
  } catch (err) {
    console.error(err)
    alert('No se pudieron cargar los productos.')
  }
})

// --- Guardar Lote ---
async function guardarLote() {
  if (!form.value.producto_id) return alert('Selecciona un producto.')
  if (form.value.cantidad_stock <= 0) return alert('Cantidad debe ser mayor a 0.')

  const hoy = new Date()
  const vencimiento = new Date(form.value.fecha_vencimiento)

  // Normalizamos horas para comparar solo fechas
  hoy.setHours(0, 0, 0, 0)
  if (vencimiento <= hoy) return alert('La fecha de vencimiento debe ser futura.')

  try {
    const res = await fetch('/api/lotes', {
      method: 'POST',
      headers: getAuthHeaders(), // Agregamos headers con token
      body: JSON.stringify(form.value),
    })

    // Si el token venció
    if (res.status === 401) {
      router.push('/login')
      return
    }

    if (!res.ok) {
      // Intentamos leer el mensaje de error del backend si existe
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.message || 'Error desconocido')
    }

    alert('✅ Lote registrado exitosamente.')

    // Limpiar formulario
    form.value = {
      producto_id: '',
      numero_lote: '',
      fecha_vencimiento: '',
      cantidad_stock: 0,
      precio_costo: 0,
      precio_venta: 0,
    }
  } catch (err: any) {
    console.error(err)
    alert(`❌ Error: ${err.message || 'No se pudo guardar el lote.'}`)
  }
}
</script>

<template>
  <div class="add-lote-container">
    <form @submit.prevent="guardarLote">
      <BaseSelect
        label="Producto"
        v-model="form.producto_id"
        :options="productos.map((p) => ({ value: p.producto_id, text: p.nombre }))"
        required
      />
      <BaseInput label="Número de Lote" v-model="form.numero_lote" placeholder="Ej. L2025-A" />
      <BaseDate label="Fecha de Vencimiento" v-model="form.fecha_vencimiento" required />
      <BaseInput label="Cantidad en Stock" v-model="form.cantidad_stock" type="number" />

      <div class="form-grid">
        <BaseInput
          label="Precio de Compra (por unidad)"
          v-model="form.precio_costo"
          type="number"
        />
        <BaseInput label="Precio de Venta (por unidad)" v-model="form.precio_venta" type="number" />
      </div>

      <BaseButton variant="primary" width="30%">Guardar Lote</BaseButton>
    </form>
  </div>
</template>

<style scoped>
.add-lote-container {
  height: auto;
  padding: 2rem 3rem;
  background: #fff;
  overflow-y: auto;
}

form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-width: 600px;
}
form .form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.add-lote-container :deep(input),
.add-lote-container :deep(select) {
  font-size: 0.75rem;
}

.add-lote-container :deep(label) {
  font-size: 0.75rem;
}

.add-lote-container :deep(button) {
  font-size: 0.7rem;
}
</style>
