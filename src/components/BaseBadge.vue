<!-- src/components/BaseBadge.vue -->
<script setup lang="ts">
const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'info' | 'default'
  small?: boolean
}>()
</script>

<template>
  <span :class="['base-badge', `badge-${props.variant || 'default'}`, { small: props.small }]">
    <slot />
  </span>
</template>

<style scoped>
.base-badge {
  display: inline-block;
  padding: 0.1rem 0.6rem;
  border-radius: 10px;
  font-weight: 500;
  font-size: 0.75rem;
  text-transform: capitalize;
  color: #fff;
  white-space: nowrap;
}

.small {
  font-size: 0.65rem;
  padding: 0.2rem 0.4rem;
}

/* 🎨 Variantes */
.badge-primary {
  background: #007bff;
}
.badge-secondary {
  background: #6c757d;
}
.badge-success {
  background: #28a745;
}
.badge-danger {
  background: #dc3545;
}
.badge-warning {
  background: #ffc107;
  color: #222;
}
.badge-info {
  background: #17a2b8;
}
.badge-default {
  background: #adb5bd;
}
</style>
