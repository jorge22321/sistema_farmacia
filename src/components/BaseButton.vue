<!-- src/components/BaseButton.vue -->
<script setup lang="ts">
const props = defineProps<{
  variant?: 'primary' | 'danger' | 'warning' | 'secondary' | 'main' | 'ecol' | 'success' // 👈 Añadido success
  full?: boolean
  width?: string | number
  bordered?: boolean
}>()
</script>

<template>
  <button
    :class="[
      'base-button',
      `btn-${props.variant || 'primary'}`,
      {
        full: props.full,
        bordered: props.bordered,
      },
    ]"
    :style="{
      width: props.width
        ? typeof props.width === 'number'
          ? props.width + 'px'
          : props.width
        : undefined,
    }"
  >
    <slot />
  </button>
</template>

<style scoped>
.base-button {
  padding: 0.6rem 1rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.base-button.full {
  width: 100%;
}

/* 🎨 Variantes */
.btn-primary {
  background: #007bff;
  color: #fff;
}
.btn-primary:hover {
  background: #0056b3;
}

.btn-danger {
  background: #dc3545;
  color: #fff;
}
.btn-danger:hover {
  background: #a71d2a;
}

.btn-warning {
  background: #ffc107;
  color: #222;
}
.btn-warning:hover {
  background: #e0a800;
}

.btn-secondary {
  background: #6c757d;
  color: #fff;
}
.btn-secondary:hover {
  background: #5a6268;
}

.btn-success {
  background: #28a745;
  color: #fff;
}
.btn-success:hover {
  background: #218838;
}

.btn-main {
  background: #fff;
  color: #5a6268;
}
.btn-main.bordered {
  color: #5a6268;
  background: transparent;
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.04);
}

.btn-ecol {
  background: #4cf000;
  color: #ffffff;
}
.btn-ecol:hover {
  background: #3cc000;
}
</style>
