src/components/TablePagination.vue
<script setup lang="ts">
import { computed } from 'vue'

const model = defineModel<number>({ required: true }) // página actual
const perPage = defineModel<number>('perPage', { default: 10 }) // registros por página
const props = defineProps<{ totalPages: number }>()

const nextPage = () => {
  if (model.value < props.totalPages) model.value++
}
const prevPage = () => {
  if (model.value > 1) model.value--
}
const firstPage = () => (model.value = 1)
const lastPage = () => (model.value = props.totalPages)

const info = computed(() => `Página ${model.value} de ${props.totalPages}`)
</script>

<template>
  <div class="pagination-container">
    <button @click="firstPage" :disabled="model <= 1">⏮</button>
    <button @click="prevPage" :disabled="model <= 1">◀</button>
    <span>{{ info }}</span>
    <button @click="nextPage" :disabled="model >= totalPages">▶</button>
    <button @click="lastPage" :disabled="model >= totalPages">⏭</button>
  </div>
</template>

<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.7rem;
  padding-top: 0.5rem;
}

.left label {
  margin-right: 0.4rem;
}

select {
  padding: 0.3rem 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.7rem;
}

.right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

button {
  background: #007bff;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.2em 0.4rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}
button:hover:not(:disabled) {
  background: #0056b3;
}
button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
