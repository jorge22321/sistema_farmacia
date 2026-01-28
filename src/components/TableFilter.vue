<script setup lang="ts">
const model = defineModel<string>()
defineProps<{ label: string; options: string[] }>()
</script>

<template>
  <div class="filter">
    <select v-model="model">
      <option value="Todos">Todos los {{ label.toLowerCase() }}</option>
      <option v-for="opt in options" :key="opt" :value="opt">{{ opt }}</option>
    </select>
  </div>
</template>

<style scoped>
.filter select {
  padding: 0.4rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.7rem;
}
</style>
