src/components/ProductCard.vue
<script setup lang="ts">
interface Product {
  producto_id: number
  nombre: string
  concentracion: string
  formato: string
  precio_venta: number
  requiere_receta: boolean
  stock_total: number
  laboratorio: string
  categoria: string
}

defineProps<{
  product: Product
}>()

defineEmits<{
  select: [product: Product]
}>()
</script>

<template>
  <div
    class="product-card"
    :class="{
      'requires-prescription': product.requiere_receta,
      'low-stock': product.stock_total < 10,
      'out-of-stock': product.stock_total <= 0,
    }"
    @click="$emit('select', product)"
  >
    <div class="product-info">
      <div class="name-row">
        <strong>{{ product.nombre }}</strong>
        <span v-if="product.requiere_receta" class="prescription-pill"> Receta</span>
      </div>

      <span>{{ product.concentracion }} - {{ product.formato }}</span>
      <small>
        Lab: {{ product.laboratorio }}
        <span v-if="product.stock_total < 10 && product.stock_total > 0" class="stock-warning"
          >⚠️ Bajo stock</span
        >
        <span v-if="product.stock_total <= 0" class="stock-error"> Agotado</span>
      </small>
    </div>

    <div class="product-actions">
      <div class="product-price">S/ {{ product.precio_venta.toFixed(2) }}</div>
      <div class="stock-display">Stock: {{ product.stock_total }}</div>
    </div>
  </div>
</template>

<style scoped>
.product-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.8rem;
  background: white;
}

.product-card:hover {
  border-color: #007bff;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.product-card.out-of-stock {
  opacity: 0.6;
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.product-info {
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 3px;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.product-info strong {
  color: #2c3e50;
  font-size: 0.9rem;
  font-weight: 600;
}

/* 🟢 Estilo del Badge "Receta" */
.prescription-pill {
  background-color: #fff3cd;
  color: #856404;
  font-size: 0.65rem;
  padding: 2px 6px;
  border-radius: 10px;
  border: 1px solid #ffeeba;
  font-weight: bold;
  white-space: nowrap;
}

.product-info span {
  color: #666;
}

.product-info small {
  color: #888;
}

.stock-warning {
  color: #e67e22;
  font-weight: bold;
  margin-left: 5px;
}
.stock-error {
  color: #e74c3c;
  font-weight: bold;
  margin-left: 5px;
}

.product-actions {
  text-align: right;
  min-width: 70px;
}

.product-price {
  font-weight: 700;
  color: #2c3e50;
  font-size: 0.9rem;
}

.stock-display {
  font-size: 0.7rem;
  color: #7f8c8d;
}
</style>
