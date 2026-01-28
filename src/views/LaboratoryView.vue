<script setup lang="ts">
import { ref, onMounted } from 'vue'

// Interface coincidiendo con la DB
interface Laboratorio {
  laboratorio_id: number
  nombre: string
  contacto: string
  descripcion: string
}

const laboratorios = ref<Laboratorio[]>([])
const loading = ref(false)

// Estados para el Modal
const mostrarFormulario = ref(false)
const editando = ref<Laboratorio | null>(null)
const form = ref<Laboratorio>({
  laboratorio_id: 0,
  nombre: '',
  contacto: '',
  descripcion: '',
})

// --- API: OBTENER LABORATORIOS ---
const fetchLaboratorios = async () => {
  loading.value = true
  try {
    const token = localStorage.getItem('token')
    const response = await fetch('http://localhost:3000/api/laboratorios', {
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      laboratorios.value = await response.json()
    } else {
      console.error('Error al cargar laboratorios')
    }
  } catch (error) {
    console.error('Error de conexión:', error)
  } finally {
    loading.value = false
  }
}

// --- ACCIONES DEL MODAL ---
const abrirNuevo = () => {
  editando.value = null
  form.value = { laboratorio_id: 0, nombre: '', contacto: '', descripcion: '' }
  mostrarFormulario.value = true
}

const editar = (lab: Laboratorio) => {
  editando.value = lab
  form.value = { ...lab } // Copia para no modificar la tabla en vivo
  mostrarFormulario.value = true
}

// --- API: GUARDAR (CREAR O EDITAR) ---
const guardar = async () => {
  const token = localStorage.getItem('token')
  if (!token) return

  try {
    if (editando.value) {
      // MODO EDITAR (PUT)
      const response = await fetch(
        `http://localhost:3000/api/laboratorios/${editando.value.laboratorio_id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(form.value),
        },
      )

      if (response.ok) {
        alert('Laboratorio actualizado')
        fetchLaboratorios() // Recargar lista
        mostrarFormulario.value = false
      } else {
        alert('Error al actualizar')
      }
    } else {
      // MODO CREAR (POST)
      const response = await fetch('http://localhost:3000/api/laboratorios', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form.value),
      })

      if (response.ok) {
        alert('Laboratorio creado con éxito')
        fetchLaboratorios() // Recargar lista
        mostrarFormulario.value = false
      } else {
        alert('Error al crear laboratorio')
      }
    }
  } catch (error) {
    console.error(error)
    alert('Error de conexión')
  }
}

// --- API: ELIMINAR ---
const eliminar = async (id: number) => {
  if (!confirm('¿Estás seguro de eliminar este laboratorio?')) return

  const token = localStorage.getItem('token')
  try {
    const response = await fetch(`http://localhost:3000/api/laboratorios/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })

    if (response.ok) {
      alert('Laboratorio eliminado')
      fetchLaboratorios()
    } else {
      const err = await response.json()
      alert(`No se pudo eliminar: ${err.message}`)
    }
  } catch (error) {
    console.error(error)
  }
}

// Cargar al inicio
onMounted(() => {
  fetchLaboratorios()
})
</script>

<template>
  <div class="laboratorios-container">
    <div class="header">
      <button class="btn-add" @click="abrirNuevo">+ Nuevo Laboratorio</button>
    </div>

    <div v-if="loading" class="loading-state">Cargando datos...</div>

    <div v-else-if="laboratorios.length" class="labs-grid">
      <div v-for="lab in laboratorios" :key="lab.laboratorio_id" class="lab-card">
        <div class="lab-header">
          <h2>{{ lab.nombre }}</h2>
          <div class="actions">
            <button @click="editar(lab)" title="Editar" class="btn-icon">✏️</button>
            <button @click="eliminar(lab.laboratorio_id)" title="Eliminar" class="btn-icon delete">
              🗑️
            </button>
          </div>
        </div>
        <p class="descripcion">{{ lab.descripcion || 'Sin descripción' }}</p>
        <p class="contacto"><strong>Contacto:</strong> {{ lab.contacto || 'No especificado' }}</p>
      </div>
    </div>

    <p v-else-if="!loading" class="sin-labs">No hay laboratorios registrados.</p>

    <div v-if="mostrarFormulario" class="modal-overlay" @click.self="mostrarFormulario = false">
      <div class="modal">
        <h2>{{ editando ? 'Editar Laboratorio' : 'Nuevo Laboratorio' }}</h2>
        <form @submit.prevent="guardar" class="form">
          <label>Nombre *</label>
          <input v-model="form.nombre" required placeholder="Ej. Bayer S.A." />

          <label>Contacto</label>
          <input v-model="form.contacto" placeholder="Correo o teléfono" />

          <label>Descripción</label>
          <textarea
            v-model="form.descripcion"
            rows="3"
            placeholder="Información adicional"
          ></textarea>

          <div class="acciones">
            <button type="button" class="btn-sec" @click="mostrarFormulario = false">
              Cancelar
            </button>
            <button type="submit" class="btn-primary">
              {{ editando ? 'Actualizar' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>
<style scoped>
.laboratorios-container {
  padding: 1.5rem;
  background: #f8f9fa;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: end;
  align-items: center;
  margin-bottom: 1rem;
}

h1 {
  color: #2c3e50;
  font-weight: 600;
}

.btn-add {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.6rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
}
.btn-add:hover {
  background: #0056b3;
}

.labs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}

.lab-card {
  background: white;
  border-radius: 10px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}
.lab-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.lab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.lab-header h2 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}

.actions button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1rem;
}
.actions button:hover {
  opacity: 0.7;
}

.descripcion {
  font-size: 0.9rem;
  color: #555;
  margin: 0.5rem 0;
}
.contacto {
  font-size: 0.85rem;
  color: #666;
}

.sin-labs {
  text-align: center;
  color: #888;
  margin-top: 2rem;
}

/* --- Modal --- */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 999;
}

.modal {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  width: 90%;
  max-width: 480px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
}

.modal h2 {
  margin-bottom: 1rem;
  color: #333;
}

.form label {
  display: block;
  font-weight: 500;
  margin-top: 0.5rem;
  color: #444;
}

.form input,
.form textarea {
  width: 100%;
  padding: 0.6rem;
  margin-top: 0.3rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
}

.acciones {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
  margin-top: 1rem;
}

.btn-sec {
  background: #6c757d;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
.btn-sec:hover {
  background: #5a6268;
}

.btn-primary {
  background: #007bff;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
}
.btn-primary:hover {
  background: #0056b3;
}
</style>
