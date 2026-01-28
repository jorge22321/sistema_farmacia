<script setup lang="ts">
defineProps<{
  modelValue: boolean
  label: string
}>()

const emit = defineEmits(['update:modelValue'])

function updateValue(event: Event) {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.checked)
}
</script>

<template>
  <div class="checkbox-group">
    <label>
      <input type="checkbox" :checked="modelValue" @change="updateValue" />
      {{ label }}
    </label>
  </div>
</template>

<style scoped>
.checkbox-group {
  display: flex;
  align-items: center;
}
label {
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: #222;
}
input[type='checkbox'] {
  width: 16px;
  height: 16px;
}
</style>
