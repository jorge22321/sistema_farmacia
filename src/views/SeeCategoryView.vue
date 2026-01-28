<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AppIcon from '@/components/AppIcon.vue'
import BaseButton from '@/components/BaseButton.vue'
import TableSearch from '@/components/TableSearch.vue'
import CategoryGrid from '@/components/CategoryCard.vue'
import BaseModal from '@/components/BaseModal.vue' // <--- Importamos el Modal

// --- Tipos ---
interface Categoria {
  categoria_id: number
  nombre: string
  descripcion: string
  estado: string
}

// --- Estado ---
const router = useRouter()
const categorias = ref<Categoria[]>([])
const search = ref('')

// Estado del Modal y Formulario
const showModal = ref(false)
const isSubmitting = ref(false)
const form = ref({
  nombre: '',
  descripcion: '',
})

// --- Helpers ---
function getAuthHeaders() {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  }
}

// --- Cargar Datos ---
const cargarCategorias = async () => {
  try {
    const res = await fetch('/api/categorias', { headers: getAuthHeaders() })
    if (res.status === 401) {
      router.push('/login')
      return
    }
    const data = await res.json()
    categorias.value = data.map((c: any) => ({ ...c, estado: 'Activo' }))
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  cargarCategorias()
})

// --- Guardar Nueva Categoría ---
async function guardarCategoria() {
  if (!form.value.nombre.trim()) {
    alert('El nombre es obligatorio')
    return
  }

  isSubmitting.value = true

  try {
    const res = await fetch('/api/categorias', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(form.value),
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.message || 'Error al guardar')
    }

    // Éxito
    alert('✅ Categoría creada exitosamente')
    showModal.value = false // Cerrar modal
    form.value = { nombre: '', descripcion: '' } // Limpiar form
    cargarCategorias() // Recargar tabla
  } catch (error: any) {
    alert(`❌ Error: ${error.message}`)
  } finally {
    isSubmitting.value = false
  }
}

// --- Filtros y Eliminar (Lógica existente) ---
const categoriasFiltradas = computed(() => {
  const term = search.value.toLowerCase()
  return categorias.value.filter(
    (c) => c.nombre.toLowerCase().includes(term) || c.descripcion.toLowerCase().includes(term),
  )
})

async function eliminarCategoria(id: number) {
  if (!confirm('¿Seguro que deseas eliminar?')) return
  try {
    const res = await fetch(`/api/categorias/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    if (res.ok) {
      categorias.value = categorias.value.filter((c) => c.categoria_id !== id)
      alert('🗑️ Eliminado.')
    } else {
      const err = await res.json()
      alert(err.message)
    }
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div class="see-category-view">
    <div class="header">
      <h2>Categorías de Productos</h2>
      <div class="actions">
        <TableSearch v-model="search" placeholder="Buscar categoría..." />

        <BaseButton variant="primary" @click="showModal = true">
          <AppIcon name="plus" /> Nueva Categoría
        </BaseButton>
      </div>
    </div>

    <CategoryGrid :categorias="categoriasFiltradas" @delete="eliminarCategoria" />

    <BaseModal :show="showModal" title="Nueva Categoría" @close="showModal = false">
      <form @submit.prevent="guardarCategoria" class="category-form">
        <div class="form-group">
          <label>Nombre *</label>
          <input
            v-model="form.nombre"
            type="text"
            placeholder="Ej. Analgésicos"
            required
            class="form-input"
          />
        </div>

        <div class="form-group">
          <label>Descripción</label>
          <textarea
            v-model="form.descripcion"
            placeholder="Breve descripción..."
            rows="3"
            class="form-input"
          ></textarea>
        </div>

        <div class="form-actions">
          <BaseButton type="button" variant="secondary" @click="showModal = false">
            Cancelar
          </BaseButton>
          <BaseButton type="submit" variant="primary" :disabled="isSubmitting">
            {{ isSubmitting ? 'Guardando...' : 'Guardar Categoría' }}
          </BaseButton>
        </div>
      </form>
    </BaseModal>
  </div>
</template>
<style scoped>
.see-category-view {
  height: auto;
  padding: 2rem 3rem;
  background: #fff;
  overflow-y: auto;
}

/* --- Encabezado --- */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}
.header h2 {
  font-size: 1.1rem;
  font-weight: 600;
}
.actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

/* Estilos del Formulario en Modal */
.category-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.form-group label {
  font-weight: 600;
  color: #444;
  font-size: 0.9rem;
}
.form-input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}
.form-input:focus {
  outline: none;
  border-color: #42b983;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}
/* 6. Todos los estilos de .grid, .card, etc., se eliminaron de aquí */
</style>
