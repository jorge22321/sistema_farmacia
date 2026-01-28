<!-- src/views/DashboardView.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as echarts from 'echarts'

// Métricas principales ultra eficientes
const keyMetrics = ref([
  {
    key: 'sales',
    title: 'Ventas',
    value: '2.4K',
    change: '+12%',
    trend: 'up',
    detail: 'Hoy',
    icon: 'trending-up',
  },
  {
    key: 'stock',
    title: 'Stock Crítico',
    value: '24',
    change: '-3%',
    trend: 'down',
    detail: 'Productos < 50',
    icon: 'alert-circle',
  },
  {
    key: 'prescriptions',
    title: 'Recetas',
    value: '18',
    change: '+8%',
    trend: 'up',
    detail: 'Pendientes',
    icon: 'file-text',
  },
  {
    key: 'customers',
    title: 'Clientes',
    value: '350',
    change: '+15%',
    trend: 'up',
    detail: 'Activos',
    icon: 'users',
  },
])

// Datos simplificados para gráficos
const simplifiedData = {
  salesTrend: [45, 52, 48, 61, 72, 85, 38, 42, 56, 68, 72, 65],
  categories: [
    { name: 'Analgésicos', value: 35, color: '#3B82F6' },
    { name: 'Antibióticos', value: 25, color: '#10B981' },
    { name: 'Vitaminas', value: 20, color: '#F59E0B' },
    { name: 'Otros', value: 20, color: '#8B5CF6' },
  ],
  hourlySales: [
    { hour: '8:00', value: 120 },
    { hour: '10:00', value: 320 },
    { hour: '12:00', value: 280 },
    { hour: '14:00', value: 180 },
    { hour: '16:00', value: 420 },
    { hour: '18:00', value: 380 },
    { hour: '20:00', value: 220 },
  ],
}

// Productos críticos (solo los más importantes)
const criticalProducts = ref([
  { name: 'Paracetamol 500mg', stock: 45, min: 100, category: 'Analgésicos' },
  { name: 'Amoxicilina 500mg', stock: 32, min: 80, category: 'Antibióticos' },
  { name: 'Ibuprofeno 400mg', stock: 28, min: 60, category: 'Analgésicos' },
  { name: 'Omeprazol 20mg', stock: 22, min: 50, category: 'Digestivos' },
])

// Alertas urgentes
const urgentAlerts = ref([
  { id: 1, type: 'expiration', product: 'Amoxicilina 500mg', days: 5, priority: 'high' },
  { id: 2, type: 'lowstock', product: 'Paracetamol 500mg', stock: 45, priority: 'medium' },
  { id: 3, type: 'prescription', product: 'Lorazepam 2mg', count: 3, priority: 'low' },
])

// Eficiencia diaria
const dailyEfficiency = ref({
  attentionTime: 4.2,
  accuracy: 98.5,
  customerSatisfaction: 4.7,
})

// Inicializar gráficos optimizados
onMounted(() => {
  initMiniCharts()
  initCategoryChart()
})

const initMiniCharts = () => {
  // Mini gráficos para métricas
  keyMetrics.value.forEach((metric, index) => {
    const chartId = `mini-chart-${index}`
    const chartDom = document.getElementById(chartId)
    if (chartDom) {
      const chart = echarts.init(chartDom, null, { renderer: 'svg', width: 60, height: 30 })

      const data = Array.from(
        { length: 12 },
        (_, i) => Math.random() * 100 + (metric.trend === 'up' ? i * 5 : -i * 5),
      )

      chart.setOption({
        grid: { top: 0, right: 0, bottom: 0, left: 0 },
        xAxis: { show: false },
        yAxis: { show: false },
        series: [
          {
            type: 'line',
            data: data,
            smooth: true,
            lineStyle: {
              width: 2,
              color: metric.trend === 'up' ? '#10B981' : '#EF4444',
            },
            symbol: 'none',
            areaStyle: {
              color: metric.trend === 'up' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            },
          },
        ],
      })
    }
  })

  // Gráfico de ventas principal
  const salesChart = echarts.init(document.getElementById('sales-chart-mini'))
  salesChart.setOption({
    grid: { top: 10, right: 10, bottom: 10, left: 10 },
    xAxis: {
      type: 'category',
      data: ['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { fontSize: 9, color: '#6B7280' },
    },
    yAxis: {
      type: 'value',
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: {
        lineStyle: { color: '#F3F4F6', type: 'dashed' },
      },
      axisLabel: { fontSize: 9, color: '#6B7280' },
    },
    series: [
      {
        type: 'line',
        data: simplifiedData.salesTrend,
        smooth: true,
        lineStyle: { width: 3, color: '#3B82F6' },
        areaStyle: { color: 'rgba(59, 130, 246, 0.1)' },
        symbol: 'circle',
        symbolSize: 6,
        itemStyle: { color: '#3B82F6' },
      },
    ],
  })
}

const initCategoryChart = () => {
  const chartDom = document.getElementById('category-chart-mini')
  if (!chartDom) return

  const chart = echarts.init(chartDom, null, { renderer: 'svg', width: 120, height: 120 })

  chart.setOption({
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}%',
    },
    series: [
      {
        type: 'pie',
        radius: ['60%', '80%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
        },
        label: {
          show: false,
        },
        emphasis: {
          scale: false,
        },
        data: simplifiedData.categories.map((cat) => ({
          value: cat.value,
          name: cat.name,
          itemStyle: { color: cat.color },
        })),
      },
    ],
  })
}

// Calcular porcentaje de stock
const getStockPercentage = (current: number, min: number) => {
  return Math.min(100, (current / min) * 100)
}

// Obtener color según prioridad
const getPriorityColor = (priority: string) => {
  const colors: Record<string, string> = {
    high: '#EF4444',
    medium: '#F59E0B',
    low: '#10B981',
  }
  return colors[priority] || '#6B7280'
}

// Formatear tiempo de atención
const formatAttentionTime = (minutes: number) => {
  const mins = Math.floor(minutes)
  const secs = Math.round((minutes - mins) * 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

<template>
  <div class="efficient-dashboard">
    <!-- Header minimalista -->
    <div class="dashboard-header-efficient">
      <div>
        <h1 class="dashboard-title">Dashboard</h1>
        <p class="dashboard-subtitle">Resumen ejecutivo de farmacia</p>
      </div>
      <div class="time-display-efficient">
        <span class="current-time">{{
          new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
        }}</span>
        <span class="current-date">{{
          new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
        }}</span>
      </div>
    </div>

    <!-- Métricas principales ultra compactas -->
    <div class="compact-metrics-grid">
      <div v-for="metric in keyMetrics" :key="metric.key" class="compact-metric-card">
        <div class="metric-header">
          <div class="metric-icon">
            <i class="fas" :class="`fa-${metric.icon}`"></i>
          </div>
          <div class="metric-title">{{ metric.title }}</div>
        </div>
        <div class="metric-content">
          <div class="metric-value">{{ metric.value }}</div>
          <div class="metric-detail">{{ metric.detail }}</div>
        </div>
        <div class="metric-footer">
          <div
            class="metric-change"
            :class="{ positive: metric.trend === 'up', negative: metric.trend === 'down' }"
          >
            {{ metric.change }}
          </div>
          <div class="metric-chart" :id="`mini-chart-${keyMetrics.indexOf(metric)}`"></div>
        </div>
      </div>
    </div>

    <!-- Sección principal de datos -->
    <div class="main-data-section">
      <!-- Ventas y categorías -->
      <div class="data-card">
        <div class="card-header">
          <h3>Ventas Mensuales</h3>
          <div class="card-actions">
            <button class="btn-icon">
              <i class="fas fa-download"></i>
            </button>
          </div>
        </div>
        <div class="chart-container-mini">
          <div id="sales-chart-mini" class="sales-chart"></div>
        </div>
        <div class="chart-stats-mini">
          <div class="stat-mini">
            <div class="stat-label">Mes Actual</div>
            <div class="stat-value">$65K</div>
            <div class="stat-change positive">+18%</div>
          </div>
          <div class="stat-mini">
            <div class="stat-label">Promedio Diario</div>
            <div class="stat-value">$2.1K</div>
          </div>
          <div class="stat-mini">
            <div class="stat-label">Día Más Alto</div>
            <div class="stat-value">Sábado</div>
            <div class="stat-change">$8.5K</div>
          </div>
        </div>
      </div>

      <!-- Distribución por categoría -->
      <div class="data-card">
        <div class="card-header">
          <h3>Ventas por Categoría</h3>
        </div>
        <div class="category-distribution">
          <div id="category-chart-mini" class="category-chart"></div>
          <div class="category-legend">
            <div
              v-for="category in simplifiedData.categories"
              :key="category.name"
              class="legend-item"
            >
              <div class="legend-color" :style="{ backgroundColor: category.color }"></div>
              <div class="legend-text">
                <div class="legend-name">{{ category.name }}</div>
                <div class="legend-value">{{ category.value }}%</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Productos críticos -->
    <div class="critical-section">
      <div class="data-card">
        <div class="card-header critical-header">
          <h3>
            <i class="fas fa-exclamation-triangle" style="color: #ef4444"></i>
            Stock Crítico
          </h3>
          <button class="btn-text">
            Ver todos
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
        <div class="critical-products">
          <div v-for="product in criticalProducts" :key="product.name" class="product-item">
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-category">{{ product.category }}</div>
            </div>
            <div class="product-stock">
              <div class="stock-bar">
                <div
                  class="stock-fill"
                  :style="{
                    width: `${getStockPercentage(product.stock, product.min)}%`,
                    backgroundColor:
                      getStockPercentage(product.stock, product.min) < 50
                        ? '#EF4444'
                        : getStockPercentage(product.stock, product.min) < 80
                          ? '#F59E0B'
                          : '#10B981',
                  }"
                ></div>
              </div>
              <div class="stock-numbers">
                <span class="current-stock">{{ product.stock }}</span>
                <span class="stock-separator">/</span>
                <span class="min-stock">{{ product.min }}</span>
              </div>
            </div>
            <button class="btn-action">
              <i class="fas fa-sync-alt"></i>
              Reabastecer
            </button>
          </div>
        </div>
      </div>

      <!-- Alertas urgentes -->
      <div class="data-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-bell" style="color: #f59e0b"></i>
            Alertas Urgentes
          </h3>
          <div class="alert-count">{{ urgentAlerts.length }}</div>
        </div>
        <div class="alerts-list-efficient">
          <div
            v-for="alert in urgentAlerts"
            :key="alert.id"
            class="alert-item-efficient"
            :style="{ borderLeftColor: getPriorityColor(alert.priority) }"
          >
            <div class="alert-icon">
              <i
                class="fas"
                :class="{
                  'fa-clock': alert.type === 'expiration',
                  'fa-box': alert.type === 'lowstock',
                  'fa-file-prescription': alert.type === 'prescription',
                }"
                :style="{ color: getPriorityColor(alert.priority) }"
              ></i>
            </div>
            <div class="alert-content">
              <div class="alert-title">
                {{
                  alert.type === 'expiration'
                    ? 'Lote por vencer'
                    : alert.type === 'lowstock'
                      ? 'Stock bajo'
                      : 'Recetas pendientes'
                }}
              </div>
              <div class="alert-detail">{{ alert.product }}</div>
            </div>
            <div class="alert-action">
              {{
                alert.type === 'expiration'
                  ? `${alert.days} días`
                  : alert.type === 'lowstock'
                    ? `${alert.stock} unidades`
                    : `${alert.count} recetas`
              }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Eficiencia y métricas de operación -->
    <div class="efficiency-section">
      <div class="data-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-tachometer-alt" style="color: #3b82f6"></i>
            Métricas de Eficiencia
          </h3>
        </div>
        <div class="efficiency-metrics-grid">
          <div class="efficiency-metric">
            <div class="metric-label">
              <i class="fas fa-clock" style="color: #8b5cf6"></i>
              Tiempo de Atención
            </div>
            <div class="metric-value">{{ formatAttentionTime(dailyEfficiency.attentionTime) }}</div>
            <div class="metric-target">Meta: < 5:00</div>
          </div>

          <div class="efficiency-metric">
            <div class="metric-label">
              <i class="fas fa-check-circle" style="color: #10b981"></i>
              Precisión
            </div>
            <div class="metric-value">{{ dailyEfficiency.accuracy }}%</div>
            <div class="metric-target">Meta: > 95%</div>
          </div>

          <div class="efficiency-metric">
            <div class="metric-label">
              <i class="fas fa-smile" style="color: #f59e0b"></i>
              Satisfacción
            </div>
            <div class="metric-value">{{ dailyEfficiency.customerSatisfaction }}/5</div>
            <div class="metric-target">Meta: > 4.5</div>
          </div>
        </div>
      </div>

      <!-- Ventas por hora -->
      <div class="data-card">
        <div class="card-header">
          <h3>
            <i class="fas fa-chart-line" style="color: #10b981"></i>
            Ventas por Hora
          </h3>
        </div>
        <div class="hourly-sales-grid">
          <div v-for="hour in simplifiedData.hourlySales" :key="hour.hour" class="hour-slot">
            <div class="hour-time">{{ hour.hour }}</div>
            <div class="hour-bar-container">
              <div
                class="hour-bar"
                :style="{ height: `${(hour.value / 500) * 60}px` }"
                :class="{ peak: hour.value > 300 }"
              >
                <div class="bar-value">${{ hour.value }}</div>
              </div>
            </div>
          </div>
        </div>
        <div class="hourly-summary">
          <div class="summary-item">
            <div>Pico:</div>
            <div class="summary-value">16:00</div>
          </div>
          <div class="summary-item">
            <div>Total:</div>
            <div class="summary-value">$1,920</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Resumen rápido -->
    <div class="quick-summary">
      <div class="summary-card">
        <div class="summary-icon" style="background-color: #eff6ff">
          <i class="fas fa-capsules" style="color: #3b82f6"></i>
        </div>
        <div class="summary-content">
          <div class="summary-title">Productos Activos</div>
          <div class="summary-value">156</div>
          <div class="summary-change positive">+8 este mes</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon" style="background-color: #f0f9ff">
          <i class="fas fa-user-md" style="color: #0ea5e9"></i>
        </div>
        <div class="summary-content">
          <div class="summary-title">Médicos Activos</div>
          <div class="summary-value">42</div>
          <div class="summary-change positive">+3 este mes</div>
        </div>
      </div>

      <div class="summary-card">
        <div class="summary-icon" style="background-color: #f0fdf4">
          <i class="fas fa-truck" style="color: #10b981"></i>
        </div>
        <div class="summary-content">
          <div class="summary-title">Pedidos Hoy</div>
          <div class="summary-value">8</div>
          <div class="summary-change">Por recibir</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.efficient-dashboard {
  padding: 1.5rem;
  background-color: #f9fafb;
  min-height: 100vh;
}

/* Header eficiente */
.dashboard-header-efficient {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e5e7eb;
}

.dashboard-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}

.dashboard-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0 0;
}

.time-display-efficient {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.25rem;
}

.current-time {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
}

.current-date {
  font-size: 0.875rem;
  color: #9ca3af;
}

/* Métricas compactas */
.compact-metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.compact-metric-card {
  background: white;
  border-radius: 12px;
  padding: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
  border: 1px solid #f3f4f6;
}

.compact-metric-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.metric-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
}

.metric-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.metric-content {
  margin-bottom: 0.75rem;
}

.metric-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  line-height: 1;
}

.metric-detail {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.metric-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.metric-change {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
}

.metric-change.positive {
  background-color: #d1fae5;
  color: #059669;
}

.metric-change.negative {
  background-color: #fee2e2;
  color: #dc2626;
}

.metric-chart {
  height: 30px;
  width: 60px;
}

/* Sección principal de datos */
.main-data-section {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.data-card {
  background: white;
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  color: #6b7280;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.btn-icon:hover {
  background-color: #f3f4f6;
}

/* Gráficos mini */
.chart-container-mini {
  height: 120px;
  margin-bottom: 1rem;
}

.sales-chart {
  height: 100%;
  width: 100%;
}

.chart-stats-mini {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
}

.stat-mini {
  text-align: center;
}

.stat-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin-bottom: 0.25rem;
}

.stat-change {
  font-size: 0.75rem;
  font-weight: 600;
}

.stat-change.positive {
  color: #059669;
}

/* Categorías */
.category-distribution {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.category-chart {
  height: 120px;
  width: 120px;
}

.category-legend {
  flex: 1;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-text {
  flex: 1;
}

.legend-name {
  font-size: 0.875rem;
  color: #374151;
  font-weight: 500;
}

.legend-value {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Sección crítica */
.critical-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.critical-header {
  margin-bottom: 1rem;
}

.btn-text {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: background-color 0.2s ease;
}

.btn-text:hover {
  background-color: #eff6ff;
}

.critical-products {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.product-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-category {
  font-size: 0.75rem;
  color: #6b7280;
}

.product-stock {
  width: 120px;
  margin: 0 1rem;
}

.stock-bar {
  height: 6px;
  background-color: #e5e7eb;
  border-radius: 3px;
  margin-bottom: 0.25rem;
  overflow: hidden;
}

.stock-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
}

.stock-numbers {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  color: #6b7280;
}

.current-stock {
  font-weight: 600;
  color: #111827;
}

.btn-action {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 0.375rem 0.75rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.375rem;
  transition: background-color 0.2s ease;
  white-space: nowrap;
}

.btn-action:hover {
  background-color: #2563eb;
}

/* Alertas eficientes */
.alert-count {
  background-color: #fef3c7;
  color: #92400e;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
}

.alerts-list-efficient {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.alert-item-efficient {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid;
  border: 1px solid #f3f4f6;
}

.alert-icon {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background-color: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-size: 0.875rem;
  font-weight: 500;
  color: #111827;
  margin-bottom: 0.125rem;
}

.alert-detail {
  font-size: 0.75rem;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.alert-action {
  font-size: 0.75rem;
  font-weight: 600;
  color: #374151;
  padding: 0.25rem 0.5rem;
  background-color: #e5e7eb;
  border-radius: 4px;
  white-space: nowrap;
}

/* Sección de eficiencia */
.efficiency-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.efficiency-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.efficiency-metric {
  text-align: center;
  padding: 1rem;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #f3f4f6;
}

.metric-label {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
}

.metric-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.metric-target {
  font-size: 0.75rem;
  color: #9ca3af;
}

/* Ventas por hora */
.hourly-sales-grid {
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.hour-slot {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hour-time {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.hour-bar-container {
  height: 60px;
  display: flex;
  align-items: flex-end;
}

.hour-bar {
  width: 24px;
  background-color: #3b82f6;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  position: relative;
}

.hour-bar.peak {
  background-color: #10b981;
}

.hour-bar:hover {
  background-color: #2563eb;
}

.hour-bar.peak:hover {
  background-color: #059669;
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 0.625rem;
  font-weight: 600;
  color: #374151;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.hour-bar:hover .bar-value {
  opacity: 1;
}

.hourly-summary {
  display: flex;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
  font-size: 0.875rem;
  color: #6b7280;
}

.summary-item {
  display: flex;
  gap: 0.5rem;
}

.summary-value {
  font-weight: 600;
  color: #111827;
}

/* Resumen rápido */
.quick-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f3f4f6;
}

.summary-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.summary-content {
  flex: 1;
}

.summary-title {
  font-size: 0.875rem;
  color: #6b7280;
  margin-bottom: 0.25rem;
}

.summary-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 0.25rem;
}

.summary-change {
  font-size: 0.75rem;
  font-weight: 500;
}

.summary-change.positive {
  color: #059669;
}

/* Responsive */
@media (max-width: 1024px) {
  .main-data-section,
  .critical-section,
  .efficiency-section,
  .quick-summary {
    grid-template-columns: 1fr;
  }

  .efficiency-metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard-header-efficient {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .time-display-efficient {
    align-items: flex-start;
  }

  .compact-metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .product-item {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }

  .product-stock {
    width: 100%;
    margin: 0;
  }

  .efficiency-metrics-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .compact-metrics-grid {
    grid-template-columns: 1fr;
  }

  .hourly-sales-grid {
    flex-wrap: wrap;
    gap: 1rem;
  }

  .hour-slot {
    width: calc(33.333% - 0.5rem);
  }

  .quick-summary {
    grid-template-columns: 1fr;
  }
}
</style>
