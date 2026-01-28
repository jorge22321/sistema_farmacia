// backend/routes/router.ts
import { Router } from 'express'
import authRoutes from './authRoutes'
import ventaRoutes from './ventaRoutes'
import productoRoutes from './productoRoutes'
import { getLaboratorios, getUbicaciones } from '../controllers/productoController'
import loteRoutes from './loteRoutes'
import categoriaRoutes from './categoriaRoutes'
import recetaRoutes from './recetaRoutes'
import stockRoutes from './stockRoutes'
import employeeRoutes from './employeeRoutes'
import locationRoutes from './locationRoutes'
import laboratorioRoutes from './laboratorioRoutes'
const router = Router()

// 1. Autenticación
router.use('/auth', authRoutes)

// 2. Ventas
router.use('/ventas', ventaRoutes)

// 3. Productos (CRUD) -> Esto crea /api/productos, /api/productos/:id
router.use('/productos', productoRoutes)
router.use('/lotes', loteRoutes)
// 4. Listas Auxiliares (Mapeo directo para coincidir con tu Vue)
// Tu Vue llama a: /api/categorias
router.get('/laboratorios', getLaboratorios)
router.get('/ubicaciones', getUbicaciones)
router.use('/categorias', categoriaRoutes)
router.use('/recetas', recetaRoutes)
router.use('/stock', stockRoutes)
router.use('/empleados', employeeRoutes)
router.use('/ubicaciones', locationRoutes)
router.use('/laboratorios', laboratorioRoutes)
export default router
