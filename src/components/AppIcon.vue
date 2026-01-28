<!-- src/components/AppIcon.vue -->
<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  name: string
  family?: 'solid' | 'regular' | 'brands'
}>()

const iconClasses = computed(() => {
  const familyClass = `fa-${props.family || 'solid'}`
  const nameClass = `fa-${props.name}`
  return [familyClass, nameClass]
})
</script>

<template>
  <i :class="iconClasses"></i>
</template>

<style scoped>
i {
  vertical-align: middle;
  width: 1.25em;
  text-align: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: margin-right 0.1s ease-out;
}

/* Animación para spinner */
i.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
