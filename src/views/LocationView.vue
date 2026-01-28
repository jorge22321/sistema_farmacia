src/views/LocationView.vue
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import TableSearch from '@/components/TableSearch.vue'
import TableFilter from '@/components/TableFilter.vue'
import TablePagination from '@/components/TablePagination.vue'
import EstadoVacio from '@/components/EstadoVacio.vue'
import BaseButton from '@/components/BaseButton.vue'
import MedicationLocationCard from '@/components/MedicationLocationCard.vue'
import LocationModal from '@/components/LocationModal.vue'

// --- Interfaces ---
interface LocationData {
  id: number
  shelf: string
  column: string
}

interface Medication {
  id: number
  name: string
  category: string
  stock: number
  location: LocationData | null
}

interface ApiLocation {
  ubicacion_id: number
  seccion: string
  estante: string
}

// --- Estado ---
const medications = ref<Medication[]>([])
const availableLocations = ref<ApiLocation[]>([]) // Para el modal
const categories = ref<string[]>(['Todos']) // Se llenará dinámicamente

const searchQuery = ref('')
const filterCategory = ref('Todos')
const currentPage = ref(1)
const perPage = ref(6)
const showEditModal = ref(false)
const showAddModal = ref(false) // Nota: Esto parece ser para CREAR ubicación nueva en DB, lo dejaré simple por ahora
const selectedMedication = ref<Medication | null>(null)
const loading = ref(false)

// --- Computed ---
// Nota: Como el filtrado lo hace el backend, esto filtra sobre lo que ya trajimos
// O idealmente, reactivamos la búsqueda al backend cuando cambian los filtros.
// Para este ejemplo, haremos filtrado local sobre la lista cargada (si la lista no es gigante).
const filteredMedications = computed(() => {
  let filtered = medications.value

  // Filtro local (opcional si el backend ya filtra)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter((med) => med.name.toLowerCase().includes(query))
  }

  if (filterCategory.value !== 'Todos') {
    filtered = filtered.filter((med) => med.category === filterCategory.value)
  }

  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredMedications.value.length / perPage.value)
})

const paginatedMedications = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  const end = start + perPage.value
  return filteredMedications.value.slice(start, end)
})

// --- API Calls ---

const fetchMedications = async () => {
  loading.value = true
  try {
    const params = new URLSearchParams()
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (filterCategory.value !== 'Todos') params.append('category', filterCategory.value)

    const token = localStorage.getItem('token')

    // Si no hay token, no hacemos la petición para evitar error 400/401
    if (!token) {
      console.warn('No hay token disponible')
      return
    }

    const response = await fetch(`http://localhost:3000/api/ubicaciones/productos?${params}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Sesión expirada')
        // Aquí podrías redirigir al login: router.push('/login')
      }
      throw new Error(`Error HTTP: ${response.status}`)
    }

    const data = await response.json()
    medications.value = Array.isArray(data) ? data : []
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}
const fetchLocationsList = async () => {
  try {
    const token = localStorage.getItem('token') // <--- TOKEN

    const response = await fetch('http://localhost:3000/api/ubicaciones/lista', {
      headers: {
        Authorization: `Bearer ${token}`, // <--- ¡AQUÍ TAMBIÉN!
      },
    })

    if (response.ok) {
      availableLocations.value = await response.json()
    } else {
      console.error('Error cargando lista de ubicaciones:', response.status)
    }
  } catch (error) {
    console.error('Error de red cargando lista de ubicaciones', error)
  }
}

// --- Métodos UI ---

const openEditModal = (medication: Medication) => {
  selectedMedication.value = medication
  // Cargamos las ubicaciones disponibles para mostrarlas en el select del modal
  fetchLocationsList()
  showEditModal.value = true
}

const saveLocation = async (locationData: any) => {
  if (!selectedMedication.value) return

  // 1. Recuperamos el token
  const token = localStorage.getItem('token')

  try {
    const response = await fetch(
      `http://localhost:3000/api/ubicaciones/productos/${selectedMedication.value.id}`,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`, // <--- ¡AQUÍ FALTABA EL TOKEN!
        },
        // Asegúrate de enviar el ID de la ubicación, no el objeto entero,
        // dependiendo de cómo venga 'locationData' desde tu Modal.
        // Si locationData es el objeto ubicación seleccionado:
        body: JSON.stringify({ ubicacion_id: locationData.id }),
      },
    )

    if (response.ok) {
      alert(`Ubicación actualizada para ${selectedMedication.value.name}`)
      showEditModal.value = false
      selectedMedication.value = null
      fetchMedications() // Recargamos la tabla
    } else {
      // Si el token expiró
      if (response.status === 401) alert('Tu sesión ha expirado. Vuelve a iniciar sesión.')
      else alert('Error al guardar la ubicación')
    }
  } catch (e) {
    console.error(e)
    alert('Error de conexión')
  }
}

const openAddModal = () => {
  // Esto sería para crear una NUEVA ubicación física en la tabla Ubicaciones
  // Por ahora solo mostramos el modal
  showAddModal.value = true
}

const saveNewLocation = async (payload: any) => {
  // payload viene del Modal así: { isNew: true, section: "Bodega", shelves: ["A1", "A2"] }

  try {
    const token = localStorage.getItem('token')
    if (!token) {
      alert('No estás autenticado')
      return
    }

    // Llamamos a la ruta que acabamos de crear en el PASO 1
    const response = await fetch('http://localhost:3000/api/ubicaciones', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        section: payload.section, // Enviamos el nombre de la sección
        shelves: payload.shelves, // Enviamos el array de estantes
      }),
    })

    if (response.ok) {
      alert(` Sección "${payload.section}" y sus estantes creados correctamente.`)
      showAddModal.value = false
      // Recargamos la lista de ubicaciones para que aparezcan en el dropdown de edición
      fetchLocationsList()
    } else {
      const errorData = await response.json()
      alert(`Error: ${errorData.message || 'No se pudo crear la ubicación'}`)
    }
  } catch (error) {
    console.error('Error creando ubicación:', error)
    alert('Error de conexión con el servidor.')
  }
}
const clearFilters = () => {
  searchQuery.value = ''
  filterCategory.value = 'Todos'
  currentPage.value = 1
  fetchMedications()
}

// --- Watchers & Hooks ---

// Refrescar cuando cambia la búsqueda (con debounce idealmente, aquí directo)
watch([searchQuery, filterCategory], () => {
  currentPage.value = 1
  // Opcional: fetchMedications() si quieres filtrado en servidor
  // Si usas filtrado local (computed), no necesitas llamar a fetch aquí
})

onMounted(() => {
  fetchMedications()
})
</script>

<template>
  <div class="location-view">
    <div class="main-container">
      <div class="search-section card">
        <div class="search-controls">
          <div class="busqueda">
            <div class="search-row">
              <TableSearch
                v-model="searchQuery"
                placeholder="Buscar por nombre de medicamento..."
              />
            </div>

            <div class="filter-row">
              <TableFilter v-model="filterCategory" label="Categorías" :options="categories" />
            </div>
          </div>
          <div class="add-location-section">
            <BaseButton variant="success" @click="openAddModal">
              <i class="fas fa-plus"></i> Añadir Ubicación Física
            </BaseButton>
          </div>
        </div>
      </div>

      <div class="results-section">
        <div v-if="loading" class="loading">
          <i class="fas fa-spinner fa-spin"></i> Cargando inventario...
        </div>

        <EstadoVacio
          v-else-if="filteredMedications.length === 0"
          titulo="No se encontraron medicamentos"
          mensaje="Intenta con otros términos de búsqueda"
          icono="box-open"
        >
          <BaseButton variant="primary" @click="clearFilters" style="margin-top: 1rem">
            Ver todos los medicamentos
          </BaseButton>
        </EstadoVacio>

        <div v-else>
          <div class="medications-grid">
            <MedicationLocationCard
              v-for="medication in paginatedMedications"
              :key="medication.id"
              :medication="medication"
              @edit-location="openEditModal"
            />
          </div>

          <TablePagination
            v-model="currentPage"
            v-model:perPage="perPage"
            :total-pages="totalPages"
          />
        </div>
      </div>
    </div>

    <LocationModal
      :show="showEditModal"
      :medication-name="selectedMedication?.name"
      :available-locations="availableLocations"
      @close="showEditModal = false"
      @save="saveLocation"
    />

    <LocationModal
      :show="showAddModal"
      :is-add-mode="true"
      @close="showAddModal = false"
      @save="saveNewLocation"
    />
  </div>
</template>

<style scoped>
.location-view {
  height: auto;
  padding: 2rem 3rem;
  background: #fff;
  overflow-y: auto;
}

.card {
  background: white;
  border-radius: 8px;
}

.main-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.busqueda {
  display: flex;
  gap: 1rem;
}

.search-controls {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.search-row,
.filter-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.add-location-section {
  text-align: right;
}

.medications-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #6c757d;
  font-size: 0.95rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

/* Responsive */
@media (max-width: 768px) {
  .location-view {
    padding: 1rem;
  }

  .medications-grid {
    grid-template-columns: 1fr;
  }

  .add-location-section {
    text-align: center;
  }

  .add-location-section .base-button {
    width: 100%;
  }
}
</style>
