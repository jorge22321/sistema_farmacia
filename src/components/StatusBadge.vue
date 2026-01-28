<!-- src/components/StatusBadge.vue -->
<script setup lang="ts">
const props = defineProps<{
  status?: 'active' | 'inactive' | 'warning' | 'success' | 'error'
  pill?: boolean
}>()
</script>

<template>
  <span :class="['status-badge', `status-${props.status || 'active'}`, { pill: props.pill }]">
    <slot />
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-block;
  padding: 0.1rem 0.6rem;
  font-size: 0.75rem;
  border-radius: 10px;
  font-weight: 500;
  text-transform: capitalize;
  white-space: nowrap;
  transition: background 0.2s ease;
}

.pill {
  border-radius: 999px;
}

/* 🎨 Colores base */
.status-active {
  background: #d4edda;
  color: #155724;
}
.status-inactive {
  background: #f8d7da;
  color: #721c24;
}
.status-warning {
  background: #fff3cd;
  color: #856404;
}
.status-success {
  background: #c3e6cb;
  color: #155724;
}
.status-error {
  background: #f5c6cb;
  color: #721c24;
}
</style>
