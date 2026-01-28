<!-- src/components/BaseStatus.vue -->
<script setup lang="ts">
defineProps<{
  status: boolean | string
  activeText?: string
  inactiveText?: string
  activeVariant?: string
  inactiveVariant?: string
}>()

// Valores por defecto
const defaultProps = {
  activeText: 'Activo',
  inactiveText: 'Inactivo',
  activeVariant: 'success',
  inactiveVariant: 'secondary',
}
</script>

<template>
  <BaseBadge
    :text="
      status ? activeText || defaultProps.activeText : inactiveText || defaultProps.inactiveText
    "
    :variant="
      status
        ? activeVariant || defaultProps.activeVariant
        : inactiveVariant || defaultProps.inactiveVariant
    "
    size="sm"
  />
</template>
