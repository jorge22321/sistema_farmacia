<script setup lang="ts">
import BaseButton from './BaseButton.vue' // ✅ Importar BaseButton

interface SaleItem {
  producto_id: number
  nombre: string
  concentracion: string
  precio_venta: number
  cantidad: number
  numero_lote: string
  stock_disponible: number
  fecha_vencimiento: string
}

const props = defineProps<{
  item: SaleItem
  index: number
}>()

const emit = defineEmits<{
  updateQuantity: [index: number, quantity: number]
  remove: [index: number]
}>()

const updateQuantity = (newQuantity: number) => {
  if (newQuantity < 1) newQuantity = 1
  if (newQuantity > props.item.stock_disponible) {
    newQuantity = props.item.stock_disponible
    alert(`Solo hay ${props.item.stock_disponible} unidades disponibles`)
  }
  emit('updateQuantity', props.index, newQuantity)
}

const increase = () => updateQuantity(props.item.cantidad + 1)
const decrease = () => updateQuantity(props.item.cantidad - 1)
const remove = () => emit('remove', props.index)
</script>

<template>
  <div class="sale-item">
    <div class="item-info">
      <strong>{{ item.nombre }}</strong>
      <span>{{ item.concentracion }}</span>
      <small>Lote: {{ item.numero_lote }} | Vence: {{ item.fecha_vencimiento }}</small>
    </div>
    <div class="item-controls">
      <BaseButton @click="decrease" variant="secondary" class="qty-btn">-</BaseButton>
      <input
        :value="item.cantidad"
        @change="(e) => updateQuantity(parseInt((e.target as HTMLInputElement).value))"
        type="number"
        min="1"
        :max="item.stock_disponible"
        class="quantity-input"
      />
      <BaseButton @click="increase" variant="secondary" class="qty-btn">+</BaseButton>

      <span class="item-price">S/ {{ (item.precio_venta * item.cantidad).toFixed(2) }}</span>
      <BaseButton @click="remove" variant="danger" class="btn-remove">×</BaseButton>
    </div>
  </div>
</template>

<style scoped>
.sale-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0; /* ✅ Padding reducido */
  border-bottom: 1px solid #eee;
  font-size: 0.8rem; /* ✅ Tamaño base reducido */
}

.item-info {
  padding-right: 1rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 2px; /* ✅ Espaciado reducido */
}

.item-info strong {
  color: #2c3e50;
  margin-bottom: 2px; /* ✅ Margen reducido */
  font-size: 0.85rem; /* ✅ Tamaño reducido */
  font-weight: 600;
}

.item-info span {
  color: #666;
  font-size: 0.75rem; /* ✅ Tamaño reducido */
  margin-bottom: 2px; /* ✅ Margen reducido */
}

.item-info small {
  color: #888;
  font-size: 0.7rem; /* ✅ Tamaño reducido */
}

.item-controls {
  display: flex;
  align-items: center;
  gap: 6px; /* ✅ Gap reducido */
  margin-right: 10px;
}

.qty-btn {
  width: 20px; /* ✅ Tamaño reducido */
  height: 20px; /* ✅ Tamaño reducido */
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem; /* ✅ Tamaño reducido */
}

.quantity-input {
  width: 35px; /* ✅ Ancho reducido */
  padding: 4px; /* ✅ Padding reducido */
  border: 1px solid #ddd;
  border-radius: 3px;
  text-align: center;
  font-size: 0.7rem; /* ✅ Tamaño reducido */
}

.item-price {
  font-weight: 500;
  color: #696969;
  min-width: 70px; /* ✅ Ancho reducido */
  text-align: right;
  font-size: 0.75rem; /* ✅ Tamaño reducido */
}

.btn-remove {
  width: 20px; /* ✅ Tamaño reducido */
  height: 20px; /* ✅ Tamaño reducido */
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem; /* ✅ Tamaño reducido */
}
</style>
