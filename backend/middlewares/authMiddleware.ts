// backend/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

// Definimos qué datos esperamos dentro del token
interface TokenPayload {
  id: number
  rol: number
  iat: number
  exp: number
}

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  // 1. Leer el token del header (Authorization: Bearer <token>)
  const tokenHeader = req.header('Authorization')

  if (!tokenHeader) {
    // Si no hay cabecera, rechazamos inmediatamente
    res.status(401).json({ message: 'Acceso denegado. No se proporcionó token.' })
    return
  }

  try {
    // 2. Limpiar el token (quitar la palabra 'Bearer ')
    // El formato suele ser "Bearer eyJhbGc..."
    const token = tokenHeader.split(' ')[1]

    if (!token) {
      res.status(401).json({ message: 'Formato de token inválido' })
      return
    }

    // 3. Verificar la firma con tu clave secreta
    const verified = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload

    // 4. Guardar los datos del usuario en la request
    // Usamos (req as any) para saltarnos la restricción de tipo de TypeScript temporalmente
    ;(req as any).user = verified

    // 5. ¡Todo bien! Continuar al siguiente paso (el controlador de ventas)
    next()
  } catch (error) {
    res.status(400).json({ message: 'Token inválido o expirado' })
  }
}
