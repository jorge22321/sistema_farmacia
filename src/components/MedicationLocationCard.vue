<script setup lang="ts">
import BaseBadge from './BaseBadge.vue'
import BaseButton from './BaseButton.vue'
import AppIcon from './AppIcon.vue'

interface Location {
  shelf: string
  column: string
}

interface Props {
  medication: {
    id: number
    name: string
    location: Location | null
    stock?: number
  }
}

const props = defineProps<Props>()
const emit = defineEmits(['edit-location'])
</script>

<template>
  <div class="medication-card" :class="{ 'low-stock': medication.stock && medication.stock < 10 }">
    <div class="card-header">
      <h3>{{ medication.name }}</h3>
    </div>

    <div class="location-section">
      <div v-if="medication.location" class="current-location">
        <div class="location-details">
          <div class="location-item">
            <span class="location-label">Estante:</span>
            <span class="location-value">{{ medication.location.shelf }}</span>
          </div>
          <div class="location-item">
            <span class="location-label">Seccion:</span>
            <span class="location-value">{{ medication.location.column }}</span>
          </div>
        </div>

        <BaseButton
          variant="secondary"
          style="width: 50%; margin-top: 0.75rem"
          @click="$emit('edit-location', medication)"
        >
          <AppIcon name="edit" /> Cambiar ubicación
        </BaseButton>
      </div>

      <div v-else class="no-location">
        <p><AppIcon name="exclamation-triangle" /> Sin ubicación</p>
        <BaseButton variant="success" @click="$emit('edit-location', medication)">
          <AppIcon name="map-marker-alt" /> Asignar ubicación
        </BaseButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.medication-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
  position: relative;
}
.medication-card:hover {
  transform: translateY(-4px);
}

.medication-card.low-stock {
  border-top-color: #dc3545;
}

.card-header {
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
}

.card-header h3 {
  margin: 0;
  font-size: 1rem;
  color: #2c3e50;
}

.location-section {
  border-radius: 6px;
  padding: 0.75rem;
}

.current-location {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.location-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

.location-item {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.location-label {
  font-size: 0.7rem;
  color: #6c757d;
}

.location-value {
  font-weight: 600;
  color: #2c3e50;
  font-size: 0.85rem;
}

.no-location {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-location p {
  margin: 0;
  color: #dc3545;
  font-size: 0.85rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.base-button {
  padding: 0.3rem 0.6rem;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}
</style>
