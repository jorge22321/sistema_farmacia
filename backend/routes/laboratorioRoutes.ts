import { Router } from 'express'
import {
  getLaboratorios,
  createLaboratorio,
  updateLaboratorio,
  deleteLaboratorio,
} from '../controllers/laboratorioController'
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

// Todas las rutas protegidas con Token
router.get('/', verifyToken, getLaboratorios)
router.post('/', verifyToken, createLaboratorio)
router.put('/:id', verifyToken, updateLaboratorio)
router.delete('/:id', verifyToken, deleteLaboratorio)

export default router
