<script setup lang="ts">
import BaseButton from './BaseButton.vue' // ✅ Importar BaseButton

// 1. CAMBIO: ID ahora es number
interface PaymentMethod {
  id: number
  label: string
}

// 2. CAMBIO: selectedPayment ahora espera un number
const props = defineProps<{
  subtotal: number
  total: number
  selectedPayment: number
  paymentMethods: PaymentMethod[]
}>()

// 3. CAMBIO: El evento emite un number
defineEmits<{
  checkout: []
  clearSale: []
  updatePayment: [methodId: number]
}>()
</script>

<template>
  <div class="sale-summary">
    <div class="total-line">
      <span>Subtotal:</span>
      <span>S/ {{ subtotal.toFixed(2) }}</span>
    </div>
    <div class="total-line">
      <span>IGV (18%):</span>
      <span>S/ {{ (subtotal * 0.18).toFixed(2) }}</span>
    </div>
    <div class="total-line grand-total">
      <span>TOTAL:</span>
      <span>S/ {{ total.toFixed(2) }}</span>
    </div>

    <div class="payment-methods">
      <h4>Método de Pago:</h4>
      <div class="payment-options">
        <label v-for="method in paymentMethods" :key="method.id">
          <input
            type="radio"
            :value="method.id"
            :checked="selectedPayment === method.id"
            @change="$emit('updatePayment', method.id)"
            name="paymentMethod"
          />
          {{ method.label }}
        </label>
      </div>
    </div>

    <div class="sale-actions">
      <BaseButton @click="$emit('checkout')" variant="primary" full class="btn-process-sale">
        Procesar Venta
      </BaseButton>

      <BaseButton @click="$emit('clearSale')" variant="danger" full class="btn-clear">
        Limpiar Venta
      </BaseButton>
    </div>
  </div>
</template>

<style scoped>
.sale-summary {
  margin-top: 10px;
  padding-top: 1px;
}

.total-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2px;
  padding: 5px 0 5px 0;
  font-size: 13px;
}

.grand-total {
  font-size: 13px;
  font-weight: bold;
  color: #000000;
  border-top: 1px solid #ddd;
  padding: 10px 0px 15px 0px;
}

.payment-methods {
  margin: 0px 0;
  padding: 5px 0px;
  border-radius: 5px;
}

.payment-methods h4 {
  margin: 0 0 10px 0;
  color: #333232;
  font-size: 14px; /* Ajuste para que coincida con el estilo general */
}

.payment-options {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 15px; /* Separación con los botones */
}

.payment-options label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 13px;
}

.sale-actions {
  display: flex;
  gap: 10px;
}

/* ✅ Los estilos de botón ahora están en BaseButton.vue */
/* Solo mantenemos estilos de layout aquí */
.btn-process-sale,
.btn-clear {
  padding: 10px;
}
</style>
