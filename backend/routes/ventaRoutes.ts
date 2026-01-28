// backend/routers/ventaRoutes.ts
import { Router } from 'express'
import { procesarVenta, getHistorialVentas } from '../controllers/ventaController'
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

// La ruta queda protegida: Primero verifyToken, luego procesarVenta
router.post('/', verifyToken, procesarVenta)
router.get('/', verifyToken, getHistorialVentas)
export default router
