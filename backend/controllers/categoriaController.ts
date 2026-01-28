import { Request, Response } from 'express'
import pool from '../database/database'
import { ResultSetHeader } from 'mysql2'

// --- OBTENER CATEGORÍAS ---
export const getCategorias = async (req: Request, res: Response) => {
  try {
    // Seleccionamos todos los campos necesarios
    const [rows] = await pool.query(
      'SELECT categoria_id, nombre, descripcion FROM Categorias ORDER BY nombre ASC',
    )
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener categorías' })
  }
}

// --- ELIMINAR CATEGORÍA ---
export const deleteCategoria = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    // Validar si tiene productos asociados antes de eliminar
    const [productos]: any = await pool.query(
      'SELECT producto_id FROM Productos WHERE categoria_id = ? LIMIT 1',
      [id],
    )

    if (productos.length > 0) {
      res
        .status(409)
        .json({ message: 'No se puede eliminar: Hay productos asociados a esta categoría.' })
      return
    }

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM Categorias WHERE categoria_id = ?',
      [id],
    )

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Categoría no encontrada' })
      return
    }

    res.json({ message: 'Categoría eliminada correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al eliminar categoría' })
  }
}
export const createCategoria = async (req: Request, res: Response) => {
  try {
    const { nombre, descripcion } = req.body

    // 1. Validación básica
    if (!nombre) {
      res.status(400).json({ message: 'El nombre de la categoría es obligatorio' })
      return
    }

    // 2. Insertar en Base de Datos
    const query = 'INSERT INTO Categorias (nombre, descripcion) VALUES (?, ?)'

    // descripcion puede ser null o string vacío, el diccionario dice TEXT (opcional)
    await pool.query<ResultSetHeader>(query, [nombre, descripcion || ''])

    res.status(201).json({ message: 'Categoría creada exitosamente' })
  } catch (error: any) {
    console.error(error)
    // Código de error MySQL para entrada duplicada (Unique constraint)
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Ya existe una categoría con ese nombre.' })
      return
    }
    res.status(500).json({ message: 'Error interno al crear categoría' })
  }
}
