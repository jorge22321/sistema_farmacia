// backend/routes/authRoutes.ts
import { Router } from 'express'
import { registrarEmpleado, login } from '../controllers/authController.ts'

const router = Router()

// Definimos la ruta POST /registro
router.post('/registro', registrarEmpleado)
router.post('/login', login)
export default router
