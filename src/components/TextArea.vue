<!-- src/components/TextArea.vue -->
<script setup lang="ts">
const model = defineModel<string>()

const props = defineProps<{
  label?: string
  placeholder?: string
  rows?: number
}>()
</script>

<template>
  <div class="text-area-wrapper">
    <!-- LABEL -->
    <label v-if="props.label" class="label">
      {{ props.label }}
    </label>

    <!-- TEXTAREA -->
    <textarea
      v-model="model"
      :placeholder="props.placeholder || 'Escribe aquí...'"
      :rows="props.rows || 4"
      class="text-area"
    ></textarea>
  </div>
</template>

<style scoped>
.text-area-wrapper {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 4px;
}

.label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #333;
}

.text-area {
  width: 100%;
  padding: 0.6rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  resize: vertical;
  font-size: 0.78rem;
  background: #fff;
  box-sizing: border-box;
}

.text-area:focus {
  outline: none;
  border-color: #007bff;
}
</style>
