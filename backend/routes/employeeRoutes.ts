import { Router } from 'express'
import { obtenerEmpleados } from '../controllers/employeeController' // <--- Este controlador te lo di pasos atrás
import { verifyToken } from '../middlewares/authMiddleware'

const router = Router()

// GET /api/empleados -> Llama al controlador para listar
router.get('/', verifyToken, obtenerEmpleados)

export default router
