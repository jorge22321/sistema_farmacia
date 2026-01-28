// backend/routes/stockRoutes.ts
import { Router } from 'express'
import { obtenerControlStock } from '../controllers/stockController'
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

router.get('/control', verifyToken, obtenerControlStock)

export default router
