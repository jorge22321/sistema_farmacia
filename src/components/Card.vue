src/components/Card.vue
<script setup lang="ts">
import AppIcon from '@/components/AppIcon.vue'

defineProps<{
  title: string
  value: string | number
  icon?: string
  color?: string
}>()
</script>

<template>
  <div class="dashboard-card">
    <div class="card-header">
      <AppIcon v-if="icon" :name="icon" class="card-icon" :style="{ color: color || '#007bff' }" />
      <h3>{{ title }}</h3>
    </div>
    <p class="card-value" :style="{ color: color || '#007bff' }">
      {{ value }}
    </p>
  </div>
</template>

<style scoped>
.dashboard-card {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  padding: 1rem 1.2rem 0rem 1.2rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}
.dashboard-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}
.card-header h3 {
  font-size: 0.85rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.card-icon {
  font-size: 1.3rem;
  color: #007bff;
}

.card-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-top: 0.4rem;
  color: #007bff;
}
</style>
