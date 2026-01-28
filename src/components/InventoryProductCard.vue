<script setup lang="ts">
import BaseButton from '@/components/BaseButton.vue'

defineProps<{
  producto: {
    producto_id: number
    nombre: string
    concentracion: string
    formato: string
    categoria: { nombre: string }
    laboratorio: { nombre: string }
    stock_actual: number
    stock_minimo: number
    lote_proximo_vencer: {
      numero_lote: string
      fecha_vencimiento: string
      cantidad: number
    } | null
  }
  estado: 'criticos' | 'bajos' | 'normales'
}>()

const emit = defineEmits(['generarPedido'])
</script>

<template>
  <div class="producto-card">
    <div class="card-header">
      <h3>{{ producto.nombre }}</h3>
      <small>{{ producto.concentracion }} / {{ producto.formato }}</small>
    </div>

    <div class="card-body">
      <div class="detalle-item">
        <span>Laboratorio:</span>
        <strong>{{ producto.laboratorio.nombre }}</strong>
      </div>
      <div class="detalle-item">
        <span>Categoría:</span>
        <strong>{{ producto.categoria.nombre }}</strong>
      </div>
      <div class="detalle-item" v-if="producto.lote_proximo_vencer">
        <span>Próx. Venc:</span>
        <strong>{{ producto.lote_proximo_vencer.fecha_vencimiento }}</strong>
        <small>(Lote: {{ producto.lote_proximo_vencer.numero_lote }})</small>
      </div>
      <div class="detalle-item" v-else>
        <span>Próx. Venc:</span>
        <strong>N/A</strong>
      </div>
    </div>

    <div class="card-stock-info">
      <div class="stock-valor" :class="estado">{{ producto.stock_actual }}</div>
      <div class="stock-label">
        <span>Unidades en Stock</span>
      </div>
    </div>

    <div class="card-actions">
      <BaseButton variant="primary" @click="$emit('generarPedido', producto)">
        Generar Pedido
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.producto-card {
  border: 1px solid #eee;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
  max-width: 250px;
}
.producto-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  padding: 0.7rem 1rem;
  border-bottom: 1px solid #f0f0f0;
}
.card-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #333;
}
.card-header small {
  font-size: 0.7rem;
  color: #777;
}

.card-body {
  padding: 0.8rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.detalle-item {
  display: flex;
  justify-content: space-between;
  font-size: 0.7rem;
}
.detalle-item span {
  color: #555;
}
.detalle-item strong {
  color: #222;
  font-weight: 600;
}
.detalle-item small {
  font-size: 0.6rem;
  color: #888;
  display: block;
}

.card-stock-info {
  padding: 0.5rem 1.25rem;
  margin: 0 1.25rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.stock-valor {
  font-size: 1.4rem;
  font-weight: 700;
}
.stock-label {
  font-size: 0.9rem;
}
.stock-valor.criticos {
  color: #dc3545;
}
.stock-valor.bajos {
  color: #e8a900;
}
.stock-valor.normales {
  color: #28a745;
}
.card-actions {
  padding: 0.7rem 1rem;
  margin-top: auto;
  border-top: 1px solid #f0f0f0;
}
</style>
