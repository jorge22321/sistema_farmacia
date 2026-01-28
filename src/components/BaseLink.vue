<!-- 📄 src/components/BaseLink.vue -->
<script setup lang="ts">
const props = defineProps<{
  to?: string
  label?: string
  external?: boolean
  color?: 'primary' | 'danger' | 'success' | 'neutral'
}>()
</script>

<template>
  <a
    v-if="external"
    :href="to"
    target="_blank"
    rel="noopener noreferrer"
    class="base-link"
    :class="`link-${color || 'primary'}`"
  >
    <slot>{{ label }}</slot>
  </a>

  <RouterLink v-else :to="to || '#'" class="base-link" :class="`link-${color || 'primary'}`">
    <slot>{{ label }}</slot>
  </RouterLink>
</template>

<style scoped>
.base-link {
  font-size: 0.8rem;
  text-decoration: none;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease;
}

/* Colores */
.link-primary {
  color: #007bff;
}
.link-primary:hover {
  text-decoration: underline;
}

.link-danger {
  color: #dc3545;
}
.link-danger:hover {
  text-decoration: underline;
}

.link-success {
  color: #28a745;
}
.link-success:hover {
  text-decoration: underline;
}

.link-neutral {
  color: #555;
}
.link-neutral:hover {
  color: #000;
  text-decoration: underline;
}
</style>
