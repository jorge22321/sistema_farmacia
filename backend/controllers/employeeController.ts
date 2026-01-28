import { Request, Response } from 'express'
import pool from '../database/database'

// Esta es la función que busca tu tabla del Frontend
export const obtenerEmpleados = async (req: Request, res: Response) => {
  try {
    // CONSULTA SQL:
    // Traemos los datos del empleado y hacemos JOIN con Roles
    // para saber si es "Administrador", "Farmacéutico", etc.
    const [rows] = await pool.query(`
      SELECT 
        e.empleado_id, 
        e.nombres, 
        e.apellidos, 
        e.correo,       -- ✅ Campo confirmado en tu PDF v2
        e.usuario,
        e.esta_activo,
        r.nombre_rol AS rol
      FROM Empleados e
      INNER JOIN Roles r ON e.role_id = r.role_id
      ORDER BY e.apellidos ASC
    `)

    res.json(rows)
  } catch (error) {
    console.error('Error al obtener empleados:', error)
    res.status(500).json({ message: 'Error al obtener la lista de empleados' })
  }
}
