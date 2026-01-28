import { Request, Response } from 'express'
import pool from '../database/database'
import { ResultSetHeader, RowDataPacket } from 'mysql2'

// 1. OBTENER TODOS LOS LABORATORIOS
export const getLaboratorios = async (req: Request, res: Response) => {
  try {
    // Ajusta los nombres de columnas según tu DB real si tienen tildes (ej: descripción)
    const [rows] = await pool.query('SELECT * FROM Laboratorios ORDER BY nombre ASC')
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener laboratorios' })
  }
}

// 2. CREAR LABORATORIO
export const createLaboratorio = async (req: Request, res: Response) => {
  const { nombre, contacto, descripcion } = req.body

  if (!nombre) {
    return res.status(400).json({ message: 'El nombre es obligatorio' })
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO Laboratorios (nombre, contacto, descripcion) VALUES (?, ?, ?)',
      [nombre, contacto || null, descripcion || null],
    )

    // Devolvemos el ID creado para que el front lo use sin recargar
    res.status(201).json({
      message: 'Laboratorio creado',
      id: result.insertId,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al crear laboratorio' })
  }
}

// 3. ACTUALIZAR LABORATORIO
export const updateLaboratorio = async (req: Request, res: Response) => {
  const { id } = req.params
  const { nombre, contacto, descripcion } = req.body

  try {
    await pool.query(
      'UPDATE Laboratorios SET nombre = ?, contacto = ?, descripcion = ? WHERE laboratorio_id = ?',
      [nombre, contacto || null, descripcion || null, id],
    )
    res.json({ message: 'Laboratorio actualizado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al actualizar laboratorio' })
  }
}

// 4. ELIMINAR LABORATORIO
export const deleteLaboratorio = async (req: Request, res: Response) => {
  const { id } = req.params

  try {
    // Verificamos si tiene productos asociados antes de borrar (Integridad Referencial)
    // Asumiendo que Productos tiene FK laboratorio_id
    const [productos] = await pool.query<RowDataPacket[]>(
      'SELECT producto_id FROM Productos WHERE laboratorio_id = ? LIMIT 1',
      [id],
    )

    if (productos.length > 0) {
      return res
        .status(400)
        .json({ message: 'No se puede eliminar: Hay productos asociados a este laboratorio.' })
    }

    await pool.query('DELETE FROM Laboratorios WHERE laboratorio_id = ?', [id])
    res.json({ message: 'Laboratorio eliminado' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al eliminar laboratorio' })
  }
}
