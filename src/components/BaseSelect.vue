// src/components/BaseSelect.vue
<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label: string
  options: { value: string | number; text: string }[]
  required?: boolean
  width?: string | number
}>()

const emit = defineEmits(['update:modelValue'])

function updateValue(event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="select-group">
    <label>{{ label }}</label>
    <select :value="modelValue" @change="updateValue" class="select-field" :required="required">
      <option value="">Selecciona una opción...</option>
      <option v-for="opt in options" :key="opt.value" :value="opt.value">
        {{ opt.text }}
      </option>
    </select>
  </div>
</template>

<style scoped>
.select-group {
  display: flex;
  flex-direction: column;
}
label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.select-field {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.75rem;
}
</style>
