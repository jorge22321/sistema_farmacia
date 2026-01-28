src/components/TarjetaReceta.vue
<script setup lang="ts">
import BaseButton from './BaseButton.vue'
import AppIcon from './AppIcon.vue'

// ✅ INTERFAZ
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

interface Props {
  receta: RecetaPendiente
}

interface Emits {
  dispensar: [receta: RecetaPendiente]
  rechazar: [receta: RecetaPendiente]
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const formatFecha = (fecha?: string) => {
  if (!fecha) return ''
  return new Date(fecha).toLocaleDateString('es-PE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

const dispensar = () => {
  emit('dispensar', props.receta)
}

const rechazar = () => {
  emit('rechazar', props.receta)
}
</script>

<template>
  <div class="tarjeta-compacta" :class="{ 'sin-stock': receta.stockDisponible < receta.cantidad }">
    <div class="header-row">
      <div class="paciente-group">
        <span class="nombre-paciente">{{ receta.pacienteNombre }}</span>
        <span class="separador">|</span>
        <span class="dni-paciente">DNI: {{ receta.pacienteDni }}</span>
      </div>
      <div class="meta-group">
        <span class="fecha">📅 {{ formatFecha(receta.fecha) }}</span>
        <span class="receta-id">#{{ receta.id }}</span>
      </div>
    </div>

    <div class="body-grid">
      <div class="col-medicamento">
        <span class="label">Prescripción</span>
        <div class="med-nombre">{{ receta.medicamentoNombre }}</div>
        <div class="med-dosis">{{ receta.instrucciones }}</div>
      </div>

      <div class="col-numeros">
        <div class="dato-mini">
          <span class="label">Cant.</span>
          <span class="valor">{{ receta.cantidad }}</span>
        </div>
        <div class="dato-mini">
          <span class="label">Repet.</span>
          <span class="valor" :class="{ alerta: receta.repeticiones_restantes <= 1 }">
            {{ receta.repeticiones_restantes }}
          </span>
        </div>
      </div>

      <div class="col-medico">
        <span class="label">Médico</span>
        <div class="medico-nombre">{{ receta.medicoNombre }}</div>
        <div class="medico-cmp">CMP: {{ receta.medicoCmp }}</div>
      </div>
    </div>

    <div class="footer-row">
      <div class="stock-status">
        <span class="label">Stock:</span>
        <strong :class="receta.stockDisponible < receta.cantidad ? 'text-danger' : 'text-success'">
          {{ receta.stockDisponible }}
        </strong>
        <span v-if="receta.stockDisponible < receta.cantidad" class="badge-error">FALTANTE</span>
      </div>

      <div class="acciones">
        <BaseButton @click="rechazar" variant="danger" size="small" class="btn-compact">
          Rechazar
        </BaseButton>
        <BaseButton
          @click="dispensar"
          :disabled="receta.stockDisponible < receta.cantidad"
          variant="primary"
          size="small"
          class="btn-compact"
        >
          Dispensar
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Contenedor Principal - Estilo "Tarjeta Técnica" */
.tarjeta-compacta {
  background: white;
  border: 1px solid #d1d5db; /* Gris medio */
  border-left: 4px solid #3b82f6; /* Azul corporativo por defecto */
  border-radius: 6px;
  padding: 0; /* Quitamos padding global para controlar por secciones */
  margin-bottom: 12px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  transition: all 0.2s;
}

.tarjeta-compacta:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border-color: #9ca3af;
}

/* Estado Sin Stock */
.tarjeta-compacta.sin-stock {
  border-left-color: #ef4444; /* Rojo borde izquierdo */
  background-color: #fffbfb;
}

/* --- HEADER --- */
.header-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.85rem;
}

.paciente-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nombre-paciente {
  font-weight: 700;
  color: #1e293b;
}

.separador {
  color: #cbd5e1;
}

.dni-paciente {
  color: #64748b;
}

.meta-group {
  font-size: 0.75rem;
  color: #94a3b8;
  display: flex;
  gap: 10px;
}

.receta-id {
  font-family: monospace;
}

/* --- BODY GRID --- */
.body-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr; /* Distribución de espacio */
  padding: 10px 12px;
  gap: 10px;
  align-items: start;
}

.label {
  display: block;
  font-size: 0.65rem;
  text-transform: uppercase;
  color: #94a3b8;
  margin-bottom: 2px;
  font-weight: 600;
  letter-spacing: 0.5px;
}

/* Columna Medicamento */
.med-nombre {
  font-size: 0.95rem;
  font-weight: 700;
  color: #0f172a;
  line-height: 1.2;
}

.med-dosis {
  font-size: 0.85rem;
  color: #475569;
  margin-top: 2px;
}

/* Columna Números */
.col-numeros {
  display: flex;
  gap: 15px;
}

.dato-mini {
  display: flex;
  flex-direction: column;
}

.dato-mini .valor {
  font-weight: 600;
  font-size: 0.9rem;
  color: #334155;
}

.valor.alerta {
  color: #d97706;
  font-weight: 800;
}

/* Columna Médico */
.medico-nombre {
  font-size: 0.85rem;
  color: #334155;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.medico-cmp {
  font-size: 0.75rem;
  color: #64748b;
}

/* --- FOOTER --- */
.footer-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 12px;
  border-top: 1px solid #f1f5f9;
  font-size: 0.8rem;
}

.stock-status {
  display: flex;
  align-items: center;
  gap: 6px;
}

.text-success {
  color: #16a34a;
}
.text-danger {
  color: #dc2626;
}

.badge-error {
  background: #fee2e2;
  color: #991b1b;
  font-size: 0.65rem;
  padding: 1px 4px;
  border-radius: 3px;
  font-weight: bold;
}

.acciones {
  display: flex;
  gap: 10px;
  align-items: center;
}

/* Botón de texto simple para rechazar (ahorra espacio visual) */
.btn-link {
  background: none;
  border: none;
  color: #ef4444;
  font-size: 0.8rem;
  cursor: pointer;
  text-decoration: underline;
  padding: 0;
}

.btn-link:hover {
  color: #b91c1c;
}

/* Ajuste al botón primario para hacerlo más bajito */
.btn-compact {
  padding: 4px 12px !important;
  font-size: 0.8rem !important;
  height: auto !important;
  min-height: 28px !important;
}
</style>
