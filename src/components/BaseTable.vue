// src/components/BaseTable.vue
<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import TableSearch from './TableSearch.vue'
import TableFilter from './TableFilter.vue'
import TablePagination from './TablePagination.vue'
import BaseSelect from './BaseSelect.vue'

const props = defineProps<{
  headers: string[]
  rows: any[]
  searchKey?: string
  filters?: { label: string; options: string[] }[]
}>()

// --- Estados ---
const searchTerm = ref('')
const selectedFilters = ref<string[]>([])
const currentPage = ref(1)
const perPage = ref(10)
const selectedColumn = ref<string>('') // columna actual

// --- Filtro general + búsqueda ---
const filteredData = computed(() => {
  let data = props.rows

  // 🔍 Filtro por texto (con columna dinámica)
  if (searchTerm.value) {
    const term = searchTerm.value.toLowerCase()

    if (selectedColumn.value) {
      // Buscar solo en la columna seleccionada
      data = data.filter((row) => String(row[selectedColumn.value]).toLowerCase().includes(term))
    } else if (props.searchKey) {
      // Si no se elige columna, usar la searchKey por defecto
      data = data.filter((row) => String(row[props.searchKey!]).toLowerCase().includes(term))
    } else {
      // Buscar en todas las columnas si no hay searchKey
      data = data.filter((row) =>
        Object.values(row).some((val) => String(val).toLowerCase().includes(term)),
      )
    }
  }

  // 🧩 Filtros adicionales
  if (props.filters?.length) {
    props.filters.forEach((filter, index) => {
      const value = selectedFilters.value[index]
      if (value && value !== 'Todos') {
        const key = filter.label.toLowerCase()
        data = data.filter((row) => String(row[key]).toLowerCase().includes(value.toLowerCase()))
      }
    })
  }

  return data
})

// --- Paginación ---
const totalPages = computed(() => Math.ceil(filteredData.value.length / perPage.value) || 1)

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * perPage.value
  return filteredData.value.slice(start, start + perPage.value)
})

// Reiniciar página si cambian filtros o búsqueda
watch([searchTerm, selectedFilters, perPage], () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="table-wrapper">
    <!-- 🔍 Búsqueda + Filtros -->
    <div class="table-controls">
      <div class="search-area">
        <TableSearch v-model="searchTerm" placeholder="Buscar..." />

        <!-- 🔽 Nuevo select de columna -->
        <BaseSelect
          v-model="selectedColumn"
          label=""
          :options="headers.map((h) => ({ value: h.toLowerCase().replace(/ /g, '_'), text: h }))"
          width="180px"
        />
      </div>

      <div class="filters">
        <TableFilter
          v-for="(filter, i) in filters"
          :key="i"
          :label="filter.label"
          :options="filter.options"
          v-model="selectedFilters[i]"
        />
      </div>
    </div>

    <!-- 🧭 Tabla completa (cabecera + cuerpo juntos para alineación) -->
    <div class="table-container">
      <table class="base-table">
        <thead>
          <tr>
            <th v-for="(header, i) in headers" :key="i">{{ header }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in paginatedData" :key="index">
            <slot name="row" :row="row" />
          </tr>
          <tr v-if="paginatedData.length === 0">
            <td :colspan="headers.length" class="no-data">Sin resultados...</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 📄 Paginación -->
    <TablePagination v-model="currentPage" :total-pages="totalPages" v-model:per-page="perPage" />
  </div>
</template>

<style scoped>
.table-wrapper {
  background: #fff;

  padding: 1rem;

  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.search-area {
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
}
.search-area :deep(label) {
  font-size: 0.7rem;
}
.search-area :deep(select) {
  font-size: 0.7rem;
  padding: 0.45rem 0.5rem;
}
.filters {
  display: flex;
  gap: 0.5rem;
}

.table-container {
  width: 100%;
  overflow-x: auto; /* ✅ Previene desalineación si hay columnas anchas */
}

.base-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed; /* ✅ Asegura que columnas se alineen */
  font-size: 0.7rem;
  color: #555;
}

.base-table th,
.base-table td {
  padding: 0.6rem;
  border-bottom: 1px solid #eee;
  text-align: left;
}

.base-table th {
  background-color: #f8f9fa;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.no-data {
  text-align: center;
  padding: 1rem;
  color: #777;
}
</style>
