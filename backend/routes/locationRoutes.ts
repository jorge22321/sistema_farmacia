// backend/routes/locationRoutes.ts
import { Router } from 'express'
import {
  obtenerProductosUbicacion,
  actualizarUbicacionProducto,
  obtenerListaUbicaciones,
  crearUbicacion,
} from '../controllers/locationController'
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

// Rutas protegidas
router.get('/productos', verifyToken, obtenerProductosUbicacion) // Lista principal
router.get('/lista', verifyToken, obtenerListaUbicaciones) // Para dropdowns
router.put('/productos/:id', verifyToken, actualizarUbicacionProducto) // Guardar cambios
router.post('/', verifyToken, crearUbicacion)
export default router
