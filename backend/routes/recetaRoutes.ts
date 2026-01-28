//src/backend/routes/recetaRoutes.ts
import { Router } from 'express'
import {
  getRecetasPendientes,
  createReceta,
  marcarDispensada,
  getHistorialDispensaciones,
} from '../controllers/recetaController'

const router = Router()

router.get('/pendientes', getRecetasPendientes)
router.post('/', createReceta)
router.put('/:id/dispensar', marcarDispensada)
router.get('/historial', getHistorialDispensaciones)

export default router
