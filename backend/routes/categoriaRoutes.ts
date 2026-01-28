import { Router } from 'express'
import { getCategorias, deleteCategoria } from '../controllers/categoriaController'
import { verifyToken } from '../middlewares/authMiddleware'
import { createCategoria } from '../controllers/categoriaController'

const router = Router()

// GET /api/categorias (Pública o Privada según prefieras, aquí la protegemos)
router.get('/', verifyToken, getCategorias)
router.post('/', verifyToken, createCategoria)
// DELETE /api/categorias/:id
router.delete('/:id', verifyToken, deleteCategoria)

export default router
