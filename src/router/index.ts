// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

// --- Layouts ---
import MainLayout from '@/layouts/MainLayout.vue'
import DashboardLayout from '@/layouts/DashboardLayout.vue'

// --- Vistas Públicas ---
import LoginView from '@/views/LoginView.vue'
import RegistroView from '@/views/RegistroView.vue'

// --- Vistas Privadas (Dashboard) ---
import DashboardView from '@/views/Dashboardview.vue' // Asegúrate que el archivo se llame así (minúscula 'v'iew) o DashboardView.vue
import PointOfSaleView from '@/views/PointOfSaleView.vue'

// Vistas Dispensación
import DispensationView from '@/views/DispensationView.vue'
import PrescriptionDispensingView from '@/views/PrescriptionDispensingView.vue'
import RecordView from '@/views/RecordView.vue'

// Vistas Inventario
import InventoryView from '@/views/InventoryView.vue'
import ProductControlView from '@/views/ProductControlView.vue'
import AddBatchView from '@/views/AddBatchView.vue'
import SeeLotsView from '@/views/SeeLotsView.vue'
import SeeProductView from '@/views/SeeProductView.vue'
import SeeCategoryView from '@/views/SeeCategoryView.vue'

// Vistas Informes
import InformationView from '@/views/InformationView.vue'
import SalesReportView from '@/views/SalesReportView.vue'
import LotsExpireView from '@/views/LotsExpireView.vue'
import LowStockView from '@/views/LowStockView.vue'

// Vistas Administración
import AdministrationView from '@/views/AdministrationView.vue'
import EmployeesView from '@/views/EmployeesView.vue' // Corregido: tenía doble punto (..)
import LocationView from '@/views/LocationView.vue'
import LaboratoryView from '@/views/LaboratoryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ----------------------------------------------------------------
    // 1. RUTAS PÚBLICAS (Login / Registro)
    // ----------------------------------------------------------------
    {
      path: '/',
      redirect: '/login', // Redirige la raíz al login
      component: MainLayout,
      children: [
        { path: 'login', name: 'login', component: LoginView },
        { path: 'registro', name: 'registro', component: RegistroView },
      ],
    },

    // ----------------------------------------------------------------
    // 2. RUTAS PRIVADAS (Requieren Token)
    // Nota: Agregamos 'meta: { requiresAuth: true }' a los padres
    // ----------------------------------------------------------------

    // --- Dashboard Principal ---
    {
      path: '/dashboard',
      component: DashboardLayout,
      meta: { requiresAuth: true }, // <--- PROTEGIDO
      children: [{ path: '', name: 'dashboard', component: DashboardView }],
    },

    // --- Punto de Venta ---
    {
      path: '/pos',
      component: DashboardLayout,
      meta: { requiresAuth: true }, // <--- PROTEGIDO
      children: [{ path: '', name: 'punto-de-venta', component: PointOfSaleView }],
    },

    // --- Dispensación ---
    {
      path: '/dispensacion',
      component: DashboardLayout,
      meta: { requiresAuth: true }, // <--- PROTEGIDO
      children: [
        { path: '', name: 'dispensacion-index', component: DispensationView },
        {
          path: 'dispensador-recetas',
          name: 'dispensador-recetas',
          component: PrescriptionDispensingView,
        },
        { path: 'historial', name: 'historial', component: RecordView },
      ],
    },

    // --- Inventario ---
    {
      path: '/inventario',
      component: DashboardLayout,
      meta: { requiresAuth: true }, // <--- PROTEGIDO
      children: [
        { path: '', name: 'inventario-index', component: InventoryView },
        { path: 'control-producto', name: 'control-producto', component: ProductControlView },
        { path: 'añadir-lote', name: 'añadir-lote', component: AddBatchView },
        { path: 'ver-lotes', name: 'ver-lotes', component: SeeLotsView },
        { path: 'ver-productos', name: 'ver-productos', component: SeeProductView },
        { path: 'ver-categoria', name: 'ver-categoria', component: SeeCategoryView },
      ],
    },

    // --- Informes ---
    {
      path: '/informes',
      component: DashboardLayout,
      meta: { requiresAuth: true }, // <--- PROTEGIDO
      children: [
        { path: '', name: 'informes-index', component: InformationView },
        { path: 'informe-ventas', name: 'informe-ventas', component: SalesReportView },
        { path: 'lotes-por-vencer', name: 'lotes-por-vencer', component: LotsExpireView },
        { path: 'stock-bajo', name: 'stock-bajo', component: LowStockView },
      ],
    },

    // --- Administración ---
    {
      path: '/administracion',
      component: DashboardLayout,
      meta: { requiresAuth: true }, // <--- PROTEGIDO
      children: [
        { path: '', name: 'administracion-index', component: AdministrationView },
        { path: 'empleados', name: 'empleados', component: EmployeesView },
        { path: 'ubicacion', name: 'ubicacion', component: LocationView },
        { path: 'laboratorio', name: 'laboratorio', component: LaboratoryView },
      ],
    },
  ],
})

// ----------------------------------------------------------------
// 3. NAVIGATION GUARD (El Portero)
// Este código se ejecuta antes de cada cambio de ruta
// ----------------------------------------------------------------
router.beforeEach((to, from, next) => {
  // Verificamos si la ruta a la que va requiere autenticación
  // .matched.some busca en la ruta actual y sus padres
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  // Obtenemos el token del almacenamiento local
  const token = localStorage.getItem('token')

  if (requiresAuth && !token) {
    // Si la ruta es privada y NO hay token, mandar al login
    next('/login')
  } else if ((to.path === '/login' || to.path === '/registro') && token) {
    // Si ya tiene token e intenta ir al login, mandarlo al dashboard
    next('/dashboard')
  } else {
    // En cualquier otro caso, dejarlo pasar
    next()
  }
})

export default router
