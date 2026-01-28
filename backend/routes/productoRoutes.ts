import { Router } from 'express'
import {
  getAllProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto,
  getCategorias,
  getLaboratorios,
  getUbicaciones,
} from '../controllers/productoController'
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

// --- Rutas de Catálogos (Sin protección estricta o con ella, según decidas) ---
// Estas coincidirán con lo que pide tu Vue: /api/categorias, etc.
// NOTA: Las registraremos en el router principal para que queden en la raíz /api/
// Pero si prefieres agruparlas aquí, las exportamos y las montamos individualmente.

// --- Rutas CRUD de Productos (Protegidas con Token) ---
router.get('/:id', verifyToken, getProducto)
router.post('/', verifyToken, createProducto)
router.put('/:id', verifyToken, updateProducto)
router.delete('/:id', verifyToken, deleteProducto)
router.get('/', verifyToken, getAllProductos)
export default router
