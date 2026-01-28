<script setup lang="ts">
defineProps<{
  modelValue: string
  label: string
  required?: boolean
}>()

const emit = defineEmits(['update:modelValue'])

function updateValue(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="date-group">
    <label>{{ label }}</label>
    <input
      type="date"
      :value="modelValue"
      @input="updateValue"
      class="date-field"
      :required="required"
    />
  </div>
</template>

<style scoped>
.date-group {
  display: flex;
  flex-direction: column;
}
label {
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.date-field {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
}
</style>
