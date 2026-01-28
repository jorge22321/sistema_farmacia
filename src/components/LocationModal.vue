<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import BaseModal from './BaseModal.vue'
import BaseButton from './BaseButton.vue'
import AppIcon from './AppIcon.vue'

// Interfaces
interface ApiLocation {
  ubicacion_id: number
  seccion: string
  estante: string
}

interface Props {
  show: boolean
  medicationName?: string
  isAddMode?: boolean
  availableLocations?: ApiLocation[]
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'save'])

// --- ESTADO MODO EDITAR (Selects existentes) ---
const selectedSection = ref('')
const selectedShelf = ref('')

// --- ESTADO MODO AÑADIR (NUEVO: Sección + Múltiples Estantes) ---
const newSectionName = ref('')
// Iniciamos con un estante vacío por defecto
const newShelvesList = ref([{ id: Date.now(), value: '' }])

// --- COMPUTED (Lógica de filtrado para modo editar) ---
const uniqueSections = computed(() => {
  const list = props.availableLocations || []
  const sections = list.map((item) => item.seccion).filter(Boolean)
  return [...new Set(sections)]
})

const availableShelves = computed(() => {
  if (!selectedSection.value) return []
  const list = props.availableLocations || []
  return list.filter((item) => item.seccion === selectedSection.value)
})

const modalTitle = computed(() => {
  return props.isAddMode ? 'Crear Nueva Ubicación' : 'Asignar Ubicación'
})

// --- MÉTODOS PARA AÑADIR ESTANTES DINÁMICAMENTE ---
const addShelfInput = () => {
  newShelvesList.value.push({ id: Date.now(), value: '' })
}

const removeShelfInput = (index: number) => {
  if (newShelvesList.value.length > 1) {
    newShelvesList.value.splice(index, 1)
  }
}

// --- LOGICA GENERAL ---
watch(
  () => props.show,
  (val) => {
    if (!val) resetForm()
  },
)

watch(selectedSection, () => {
  selectedShelf.value = ''
})

const handleSave = () => {
  // CASO 1: MODO AÑADIR (Tu requerimiento nuevo)
  if (props.isAddMode) {
    // Limpiamos estantes vacíos
    const validShelves = newShelvesList.value.map((s) => s.value.trim()).filter((s) => s !== '')

    if (!newSectionName.value || validShelves.length === 0) {
      alert('Debes ingresar un nombre de sección y al menos un estante.')
      return
    }

    // Emitimos la estructura que espera tu backend "crearUbicacion"
    emit('save', {
      isNew: true,
      section: newSectionName.value,
      shelves: validShelves, // Array de strings ["E1", "E2"]
    })
  }
  // CASO 2: MODO EDITAR (Selección existente)
  else {
    if (!selectedSection.value || !selectedShelf.value) {
      alert('Por favor, complete todos los campos')
      return
    }
    const locationFound = props.availableLocations?.find(
      (l) => l.seccion === selectedSection.value && l.estante === selectedShelf.value,
    )

    if (locationFound) {
      emit('save', {
        isNew: false,
        id: locationFound.ubicacion_id,
      })
    }
  }

  resetForm()
}

const handleClose = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  selectedSection.value = ''
  selectedShelf.value = ''
  newSectionName.value = ''
  newShelvesList.value = [{ id: Date.now(), value: '' }]
}
</script>

<template>
  <BaseModal :show="show" :title="modalTitle" @close="handleClose">
    <div v-if="isAddMode" class="modal-body-content">
      <p class="helper-text">Define el nombre de la nueva zona y sus niveles.</p>

      <div class="form-group">
        <label>Nombre de Sección *</label>
        <input v-model="newSectionName" class="form-input" placeholder="Ej: Almacén Trasero" />
      </div>

      <label class="label-separator">Estantes a crear *</label>

      <div class="shelves-list">
        <div v-for="(shelf, index) in newShelvesList" :key="shelf.id" class="shelf-row">
          <input v-model="shelf.value" class="form-input" :placeholder="`Ej: Nivel ${index + 1}`" />

          <button
            v-if="newShelvesList.length > 1"
            class="icon-btn delete"
            @click="removeShelfInput(index)"
            title="Eliminar fila"
          >
            <AppIcon name="trash" />
          </button>
        </div>
      </div>

      <div class="add-more-container">
        <BaseButton variant="secondary" bordered full @click="addShelfInput">
          <AppIcon name="plus" /> Agregar otro estante
        </BaseButton>
      </div>
    </div>

    <div v-else class="modal-body-content">
      <div class="form-group">
        <label for="sectionSelect">Sección *</label>
        <select id="sectionSelect" v-model="selectedSection" class="form-input">
          <option value="" disabled>Seleccione una sección</option>
          <option v-for="section in uniqueSections" :key="section" :value="section">
            {{ section }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="shelfSelect">Estante *</label>
        <select
          id="shelfSelect"
          v-model="selectedShelf"
          class="form-input"
          :disabled="!selectedSection"
        >
          <option value="" disabled>
            {{ selectedSection ? 'Seleccione un estante' : 'Primero seleccione sección' }}
          </option>
          <option v-for="loc in availableShelves" :key="loc.ubicacion_id" :value="loc.estante">
            {{ loc.estante }}
          </option>
        </select>
      </div>
    </div>

    <div class="modal-footer">
      <BaseButton variant="secondary" @click="handleClose"> Cancelar </BaseButton>
      <BaseButton variant="primary" @click="handleSave">
        <AppIcon name="save" /> {{ isAddMode ? 'Crear Todo' : 'Guardar' }}
      </BaseButton>
    </div>
  </BaseModal>
</template>

<style scoped>
/* Estilos generales */
.modal-body-content {
  padding-bottom: 10px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label,
.label-separator {
  display: block;
  margin-bottom: 0.3rem;
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
}

/* INPUTS Y SELECTS (Estilo unificado) */
.form-input {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background-color: white;
  box-sizing: border-box; /* Importante para que no se salga del contenedor */
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

.form-input:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

/* ESTILOS ESPECÍFICOS PARA MODO AÑADIR */
.helper-text {
  font-size: 0.85rem;
  color: #666;
  margin-bottom: 1rem;
  background: #f0f4f8;
  padding: 0.5rem;
  border-radius: 4px;
}

.shelves-list {
  max-height: 200px;
  overflow-y: auto;
  margin-bottom: 1rem;
}

.shelf-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  align-items: center;
}

.icon-btn.delete {
  background: #fee2e2;
  color: #ef4444;
  border: none;
  border-radius: 6px;
  width: 40px;
  height: 38px; /* Misma altura que el input */
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s;
}

.icon-btn.delete:hover {
  background: #fecaca;
}

.add-more-container {
  margin-top: 0.5rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  border-top: 1px solid #eee;
  padding-top: 1rem;
  margin-top: 1rem;
}
</style>
