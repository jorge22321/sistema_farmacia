<!-- src/components/TableSearch.vue -->
<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'

const model = defineModel<string>()
const props = defineProps<{ placeholder?: string }>()
</script>

<template>
  <div class="table-search-wrapper">
    <AppIcon name="magnifying-glass" family="solid" class="icon" />

    <input
      v-model="model"
      :placeholder="props.placeholder || 'Buscar...'"
      class="table-search"
      type="text"
    />
  </div>
</template>

<style scoped>
.table-search-wrapper {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  width: 250px;
  padding: 0.45rem 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  background: white;
}

.icon {
  font-size: 0.8rem;
  color: #666;
  margin-right: 0; /* evita margen del AppIcon */
}

.table-search {
  width: 100%;
  border: none;
  outline: none;
  font-size: 0.75rem;
  background: transparent;
}
</style>
