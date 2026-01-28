src/views/PrescriptionDispensingView.vue

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router' // ✅ 1. Importar Router
import axios from 'axios'
// ... tus otros imports (BaseButton, etc) se mantienen igual ...
import BaseButton from '@/components/BaseButton.vue'
import BaseInput from '@/components/BaseInput.vue'
import BaseSelect from '@/components/BaseSelect.vue'
import AppIcon from '@/components/AppIcon.vue'
import BaseDate from '@/components/BaseDate.vue'
import TextArea from '@/components/TextArea.vue'
import TableSearch from '@/components/TableSearch.vue'
import TarjetaReceta from '@/components/TarjetaReceta.vue'
import EstadoVacio from '@/components/EstadoVacio.vue'

const router = useRouter()
// ==================== TIPOS ====================
interface Medicamento {
  producto_id: number
  nombre: string
  concentracion: string
  formato: string
  laboratorio: string
  precio_venta: number
  stock_total: number
  requiere_receta: boolean
}

// Estructura para enviar al backend
interface RecetaForm {
  pacienteNombre: string
  pacienteApellido: string
  pacienteDni: string
  pacienteFecNac: string
  pacienteTel: string
  pacienteDir: string
  medicoNombre: string
  medicoApellido: string
  medicoCmp: string
  medicoEspecialidad: string
  medicamentoId: number | null
  instrucciones: string
  cantidad: number
  repeticiones: number
}

interface RecetaPendiente {
  id: number
  pacienteNombre: string
  pacienteDni: string
  medicoNombre: string
  medicoCmp: string
  medicamentoId: number
  medicamentoNombre: string
  instrucciones: string
  cantidad: number
  repeticiones_restantes: number
  fecha: string
  stockDisponible: number
}

// ==================== ESTADO ====================
const vistaActiva = ref<'nueva' | 'pendientes'>('nueva')
const horaActual = ref('')
const busquedaMedicamento = ref('')
const filtroPendientes = ref('')
const medicamentoSeleccionado = ref<Medicamento | null>(null)
const observaciones = ref('')

const nuevaReceta = ref<RecetaForm>({
  pacienteNombre: '',
  pacienteApellido: '',
  pacienteDni: '',
  pacienteFecNac: '',
  pacienteTel: '',
  pacienteDir: '',
  medicoNombre: '',
  medicoApellido: '',
  medicoCmp: '',
  medicoEspecialidad: '',
  medicamentoId: null,
  instrucciones: '',
  cantidad: 1,
  repeticiones: 1,
})

const medicamentosResultados = ref<Medicamento[]>([])
const recetasPendientes = ref<RecetaPendiente[]>([])

const opcionesRepeticiones = [
  { value: 1, text: '1 vez (Única)' },
  { value: 2, text: '2 veces' },
  { value: 3, text: '3 veces' },
  { value: 6, text: 'Tratamiento Crónico (6 meses)' },
]

// ==================== COMPUTED (CORREGIDO) ====================
// Aquí estaba el problema: faltaban campos obligatorios para activar el botón
const formularioValido = computed(() => {
  const form = nuevaReceta.value

  // Verificamos que los campos de texto no estén vacíos
  const camposTextoCompletos =
    form.pacienteNombre.trim() !== '' &&
    form.pacienteApellido.trim() !== '' && // Faltaba
    form.pacienteDni.trim() !== '' &&
    form.medicoNombre.trim() !== '' &&
    form.medicoApellido.trim() !== '' && // Faltaba
    form.medicoCmp.trim() !== '' &&
    form.instrucciones.trim() !== ''

  // Verificamos selección de medicamento y cantidad
  const medicamentoValido = medicamentoSeleccionado.value !== null && form.medicamentoId !== null
  const cantidadValida = form.cantidad > 0

  return camposTextoCompletos && medicamentoValido && cantidadValida
})

const recetasPendientesFiltradas = computed(() => {
  if (!filtroPendientes.value.trim()) return recetasPendientes.value

  const query = filtroPendientes.value.toLowerCase()
  return recetasPendientes.value.filter(
    (receta) =>
      receta.pacienteNombre.toLowerCase().includes(query) ||
      receta.medicamentoNombre.toLowerCase().includes(query) ||
      receta.pacienteDni.includes(query),
  )
})

// ==================== MÉTODOS ====================
const actualizarHora = () => {
  horaActual.value = new Date().toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

// 1. Buscar Medicamentos
const buscarMedicamentos = async () => {
  if (busquedaMedicamento.value.length < 3) {
    medicamentosResultados.value = []
    return
  }

  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get('http://localhost:3000/api/productos', {
      headers: { Authorization: `Bearer ${token}` },
    })

    const q = busquedaMedicamento.value.toLowerCase()
    medicamentosResultados.value = data
      .filter(
        (m: any) => m.nombre.toLowerCase().includes(q) || m.laboratorio?.toLowerCase().includes(q),
      )
      .slice(0, 5)
  } catch (error) {
    console.error('Error buscando medicamentos', error)
  }
}

// Selección de Medicamento
const seleccionarMedicamento = (medicamento: Medicamento) => {
  console.log('Medicamento seleccionado:', medicamento)
  medicamentoSeleccionado.value = medicamento
  nuevaReceta.value.medicamentoId = medicamento.producto_id
  busquedaMedicamento.value = medicamento.nombre
  medicamentosResultados.value = []
}

// 2. Cargar Recetas Pendientes
const cargarPendientes = async () => {
  try {
    const token = localStorage.getItem('token')
    const { data } = await axios.get('http://localhost:3000/api/recetas/pendientes', {
      headers: { Authorization: `Bearer ${token}` },
    })
    recetasPendientes.value = data
  } catch (error) {
    console.error('Error cargando recetas pendientes', error)
  }
}

// 3. Procesar (Guardar) Receta - CON LOGS DE DEPURACIÓN
const procesarReceta = async () => {
  console.log('Intentando registrar receta...') // DEBUG

  if (!formularioValido.value) {
    alert(
      'Por favor complete todos los campos obligatorios y seleccione un medicamento de la lista.',
    )
    return
  }

  try {
    const token = localStorage.getItem('token')

    const instruccionesFinal = observaciones.value
      ? `${nuevaReceta.value.instrucciones} - Obs: ${observaciones.value}`
      : nuevaReceta.value.instrucciones

    // Aseguramos que el ID del medicamento esté presente
    if (!nuevaReceta.value.medicamentoId && medicamentoSeleccionado.value) {
      nuevaReceta.value.medicamentoId = medicamentoSeleccionado.value.producto_id
    }

    const payload = { ...nuevaReceta.value, instrucciones: instruccionesFinal }
    console.log('Enviando payload:', payload) // DEBUG

    await axios.post('http://localhost:3000/api/recetas', payload, {
      headers: { Authorization: `Bearer ${token}` },
    })

    // Éxito
    limpiarFormulario()
    await cargarPendientes()
    vistaActiva.value = 'pendientes'
    alert('✅ Receta registrada exitosamente')
  } catch (error: any) {
    console.error('Error procesando receta:', error)
    const msg = error.response?.data?.message || 'Error interno al guardar'
    alert(`❌ Error: ${msg}`)
  }
}

// 4. Dispensar
const dispensarReceta = async (receta: RecetaPendiente) => {
  // Validación básica visual
  if (receta.stockDisponible < receta.cantidad) {
    if (
      !confirm(
        '⚠️ Stock insuficiente en sistema. ¿Desea enviar a caja de todos modos para intentar la venta?',
      )
    ) {
      return
    }
  }

  const idReal = receta.id || (receta as any).receta_id
  if (!idReal) {
    alert('Error: ID de receta no válido')
    return
  }

  try {
    const token = localStorage.getItem('token')

    // 1. Llamamos al backend para bajar la repetición (NO baja stock)
    const response = await axios.put(
      `http://localhost:3000/api/recetas/${idReal}/dispensar`,
      {},
      { headers: { Authorization: `Bearer ${token}` } },
    )

    // 2. Preparamos el item para el carrito
    const itemParaCarrito = {
      producto_id: receta.medicamentoId,
      cantidad: receta.cantidad,
      autoclick: true, // Flag para que el POS sepa que debe agregarlo solo
    }

    // 3. Guardamos en almacenamiento temporal para que lo lea la otra vista
    localStorage.setItem('producto_dispensado', JSON.stringify(itemParaCarrito))

    alert('✅ Receta validada. Redirigiendo a Caja para cobro...')

    // 4. Redirigimos a la vista de ventas (Asumo que tu ruta es /ventas o /)
    router.push('/')
  } catch (error: any) {
    console.error(error)
    alert('Error al dispensar: ' + (error.response?.data?.message || 'Error de conexión'))
  }
}

const rechazarReceta = (receta: RecetaPendiente) => {
  if (confirm('¿Archivar esta receta?')) {
    const idx = recetasPendientes.value.findIndex((r) => r.id === receta.id)
    if (idx !== -1) recetasPendientes.value.splice(idx, 1)
  }
}

const limpiarFormulario = () => {
  nuevaReceta.value = {
    pacienteNombre: '',
    pacienteApellido: '',
    pacienteDni: '',
    pacienteFecNac: '',
    pacienteTel: '',
    pacienteDir: '',
    medicoNombre: '',
    medicoApellido: '',
    medicoCmp: '',
    medicoEspecialidad: '',
    medicamentoId: null,
    instrucciones: '',
    cantidad: 1,
    repeticiones: 1,
  }
  medicamentoSeleccionado.value = null
  busquedaMedicamento.value = ''
  observaciones.value = ''
}

onMounted(() => {
  actualizarHora()
  cargarPendientes()
  const intervalo = setInterval(actualizarHora, 60000)

  onUnmounted(() => {
    clearInterval(intervalo)
  })
})
</script>

<template>
  <div class="dispensador-recetas">
    <div class="tabs">
      <BaseButton
        :variant="vistaActiva === 'nueva' ? 'primary' : 'main'"
        bordered
        @click="vistaActiva = 'nueva'"
        class="tab-btn"
      >
        <AppIcon name="file-prescription" /> Nueva Receta
      </BaseButton>
      <BaseButton
        :variant="vistaActiva === 'pendientes' ? 'primary' : 'main'"
        bordered
        @click="vistaActiva = 'pendientes'"
        class="tab-btn"
      >
        <AppIcon name="clock" /> Pendientes
        <span class="badge" v-if="recetasPendientes.length > 0">
          {{ recetasPendientes.length }}
        </span>
      </BaseButton>
    </div>

    <div class="contenido">
      <div v-if="vistaActiva === 'nueva'" class="vista-nueva">
        <div class="formulario-receta">
          <div class="form-izquierda">
            <div class="form-seccion">
              <h4>Datos del Paciente</h4>
              <div class="form-grid paciente">
                <BaseInput
                  v-model="nuevaReceta.pacienteNombre"
                  label="Nombres"
                  placeholder=""
                  :width="300"
                  required
                />
                <BaseInput
                  v-model="nuevaReceta.pacienteApellido"
                  label="Apellidos"
                  placeholder=""
                  required
                />
              </div>
              <div class="form-grid paciente">
                <BaseInput v-model="nuevaReceta.pacienteDni" label="DNI" placeholder="" required />
                <BaseDate
                  v-model="nuevaReceta.pacienteFecNac"
                  label="F. Nacimiento"
                  placeholder=""
                />
                <BaseInput v-model="nuevaReceta.pacienteTel" label="Teléfono" placeholder="" />
                <BaseInput v-model="nuevaReceta.pacienteDir" label="Dirección" placeholder="" />
              </div>
            </div>

            <div class="form-seccion">
              <h4>Datos del Médico</h4>
              <div class="form-grid medico">
                <BaseInput
                  v-model="nuevaReceta.medicoNombre"
                  label="Nombres"
                  placeholder=""
                  required
                />
                <BaseInput
                  v-model="nuevaReceta.medicoApellido"
                  label="Apellidos"
                  placeholder=""
                  required
                />
              </div>
              <div class="form-grid medico">
                <BaseInput
                  v-model="nuevaReceta.medicoCmp"
                  label="CMP (Matrícula)"
                  placeholder=""
                  required
                />
                <BaseInput
                  v-model="nuevaReceta.medicoEspecialidad"
                  label="Especialidad"
                  placeholder=""
                  required
                />
              </div>
            </div>
          </div>

          <div class="form-derecho">
            <div class="form-seccion">
              <h4>Detalle de Prescripción</h4>
              <div class="form-grid medicamento">
                <div class="buscador-wrapper">
                  <BaseInput
                    v-model="busquedaMedicamento"
                    label="Buscar medicamento (mín 3 letras)"
                    placeholder="Escriba nombre del producto..."
                    @input="buscarMedicamentos"
                    :width="400"
                  />
                  <ul v-if="medicamentosResultados.length > 0" class="search-dropdown">
                    <li
                      v-for="med in medicamentosResultados"
                      :key="med.producto_id"
                      @click="seleccionarMedicamento(med)"
                    >
                      <strong>{{ med.nombre }}</strong> - {{ med.concentracion }} ({{
                        med.laboratorio
                      }})
                    </li>
                  </ul>
                </div>

                <div class="dosis-grid">
                  <BaseInput
                    v-model.number="nuevaReceta.cantidad"
                    label="Cantidad"
                    type="number"
                    :min="1"
                    :width="120"
                    required
                  />
                  <BaseSelect
                    v-model.number="nuevaReceta.repeticiones"
                    label="Repeticiones"
                    :options="opcionesRepeticiones"
                    :width="200"
                  />
                </div>

                <TextArea
                  v-model="nuevaReceta.instrucciones"
                  label="Indicaciones / Dosis (Ej: 1 cada 8 horas)"
                  placeholder="Ingrese instrucciones detalladas..."
                  required
                />
              </div>
            </div>
          </div>
        </div>

        <div class="acciones-formulario">
          <BaseButton
            @click="procesarReceta"
            :disabled="!formularioValido"
            variant="primary"
            class="btn-procesar"
          >
            <AppIcon name="check" /> Registrar Receta
          </BaseButton>
          <BaseButton @click="limpiarFormulario" variant="secondary" class="btn-limpiar">
            <AppIcon name="trash" /> Limpiar
          </BaseButton>
        </div>
      </div>

      <div v-if="vistaActiva === 'pendientes'" class="vista-pendientes">
        <div class="cabecera-pendientes">
          <div class="controles-pendientes">
            <TableSearch
              v-model="filtroPendientes"
              placeholder="Buscar por paciente, DNI o medicamento..."
            />
          </div>
        </div>

        <div class="lista-pendientes">
          <TarjetaReceta
            v-for="receta in recetasPendientesFiltradas"
            :key="receta.id"
            :receta="receta"
            @dispensar="dispensarReceta"
            @rechazar="rechazarReceta"
          />

          <EstadoVacio v-if="recetasPendientesFiltradas.length === 0" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dispensador-recetas {
  height: auto;
  padding: 1rem 1rem;
  background: #fff;
  overflow-y: auto;
}

.formulario-receta {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  gap: 3rem; /* separación entre ambos bloques */
}
.form-derecho {
  width: 50%;
  display: flex;
  flex-direction: column; /* <-- AHORA EN COLUMNA */
  gap: 1rem;
}
.form-izquierda {
  width: 50%;
}
.form-seccion {
  margin-top: 20px;
  max-width: 600px;
  border-radius: 8px;
  border: 1px solid #eee;
  padding: 1rem 1.5rem;
}

h4 {
  margin: 0px 0px 10px 0px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  padding: 0 0 10px 10px;
}
.form-grid.medicamento {
  display: flex; /* <-- CAMBIO A FLEX */
  flex-direction: column; /* <-- LISTA VERTICAL */
  gap: 1rem;
}

.campo-textarea textarea {
  width: 100%;
  max-width: 420px;
  min-height: 90px;
  padding: 8px;
  border-radius: 6px;
  font-size: 0.8rem;
}
.form-grid.medicamento :deep(.base-input),
.form-grid.medicamento :deep(input),
.form-grid.medicamento :deep(select),
.form-grid.medicamento :deep(textarea) {
  width: 100% !important; /* <-- OCUPA TODO EL ANCHO */
  max-width: 420px !important; /* <-- MÁS ANCHO VISIBLE */
}
.dispensador-recetas :deep(input) {
  font-size: 0.7rem;
}
.dispensador-recetas :deep(label) {
  font-size: 0.75rem;
}

.dispensador-recetas :deep(button) {
  font-size: 0.75rem;
}
/* Tabs */
.tabs {
  display: flex;
  gap: 20px;
  margin-bottom: 10px;
  justify-content: start;
}

.tab-btn {
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge {
  background: #e74c3c;
  color: white;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 0.7rem;
  margin-left: 5px;
}

/* Contenido */
.contenido {
  border-radius: 8px;
}

.medicamento-seleccionado {
  background: #e8f5e8;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #27ae60;
  display: flex;
  align-items: center;
  gap: 10px;
}

.info-seleccionado {
  display: flex;
  flex-direction: column;
}

/* Resumen */
.resumen-receta {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 6px;
  margin: 20px 0;
}

.resumen-receta h4 {
  margin: 0 0 15px 0;
  color: #2c3e50;
}

.detalles-resumen {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.item-resumen {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e9ecef;
}

.etiqueta {
  font-weight: bold;
  color: #34495e;
}

.valor {
  color: #2c3e50;
}

.total {
  font-weight: bold;
  color: #27ae60;
  font-size: 1.1em;
}

/* Acciones */
.acciones-formulario {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin: 20px 0px 0px 0px;
}

.btn-procesar,
.btn-limpiar {
  padding: 12px 24px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Vista Pendientes */
.cabecera-pendientes {
  display: flex;
  justify-content: end;
  align-items: center;
  margin-bottom: 20px;
}

.cabecera-pendientes h2 {
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 0;
}

.lista-pendientes {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.tarjeta-receta {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 8px;

  box-shadow: 0 3px 3px rgba(0, 0, 0, 0.1);
}

.tarjeta-receta.stock-insuficiente {
  border-left: 4px solid #e74c3c;
  background: #fff9e6;
}

.tarjeta-receta.urgente {
  border-left: 4px solid #f39c12;
}

.cabecera-receta {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 5px;
}

.info-paciente h3 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.dni {
  color: #666;
  font-size: 14px;
}

.meta-receta {
  text-align: right;
}

.numero {
  display: block;
  font-weight: bold;
  color: #3498db;
}

.fecha {
  font-size: 12px;
  color: #666;
}

.detalles-receta {
  margin-bottom: 15px;
}

.detalle {
  display: flex;
  margin-bottom: 8px;
}

.detalle .etiqueta {
  min-width: 120px;
  font-weight: bold;
  color: #34495e;
}

.detalle .valor {
  flex: 1;
  color: #2c3e50;
}

.estado-receta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top: 1px solid #e9ecef;
}

.info-stock {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.info-stock.insuficiente {
  color: #e74c3c;
  font-weight: bold;
}

.alerta-stock {
  background: #e74c3c;
  color: white;
  padding: 4px 8px;
  border-radius: 3px;
  font-size: 12px;
}

.acciones-receta {
  display: flex;
  gap: 10px;
}

.btn-dispensar,
.btn-rechazar {
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.estado-vacio {
  text-align: center;
  padding: 60px 20px;
  color: #7f8c8d;
}

.estado-vacio h3 {
  margin: 15px 0 10px 0;
  color: #2c3e50;
}

.dosis-grid {
  margin-top: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.search-dropdown {
  padding: 0 auto;
  font-size: 0.9rem;
  margin: 0;
}
</style>
