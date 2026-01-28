import { Router } from 'express'
import { createLote } from '../controllers/loteController'
import { verifyToken } from '../middlewares/authMiddleware'
import { getLotes } from '../controllers/loteController'
import { obtenerLotesPorVencer } from '../controllers/loteController'

const router = Router()

// POST /api/lotes
router.post('/', verifyToken, createLote)
router.get('/', verifyToken, getLotes)
router.get('/vencimiento', verifyToken, obtenerLotesPorVencer)
export default router
