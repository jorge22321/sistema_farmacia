<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label: string
  type?: string
  placeholder?: string
  width?: string | number
}>()

const emit = defineEmits(['update:modelValue'])

function updateValue(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="input-group">
    <label>{{ label }}</label>
    <input
      :type="type || 'text'"
      :value="modelValue"
      @input="updateValue"
      class="input-field"
      :placeholder="placeholder"
    />
  </div>
</template>

<style scoped>
.input-group {
  width: 100%;
  display: flex;
  flex-direction: column;
}
label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #222;
  margin-bottom: 0.3rem;
}
.input-field {
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.9rem;
}
</style>
