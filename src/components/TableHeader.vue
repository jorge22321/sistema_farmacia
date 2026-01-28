<script setup lang="ts">
defineProps<{ headers: string[] }>()
</script>

<template>
  <table class="table-header">
    <thead>
      <tr>
        <th v-for="header in headers" :key="header">{{ header }}</th>
      </tr>
    </thead>
  </table>
</template>

<style scoped>
.table-header {
  width: 100%;
  border-collapse: collapse;
}

.table-header th {
  background: #ffffff;
  color: #2b2b2b;
  padding: 0.6rem;
  font-size: 0.85rem;
  text-align: left;
}
</style>
