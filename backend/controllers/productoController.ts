import { Request, Response } from 'express'
import pool from '../database/database'
import { ResultSetHeader, RowDataPacket } from 'mysql2'

// --- 1. OBTENER LISTAS AUXILIARES (Para los Selects del Frontend) ---

export const getCategorias = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT categoria_id, nombre FROM Categorias ORDER BY nombre ASC',
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías' })
  }
}

export const getLaboratorios = async (req: Request, res: Response) => {
  try {
    const [rows] = await pool.query(
      'SELECT laboratorio_id, nombre FROM Laboratorios ORDER BY nombre ASC',
    )
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener laboratorios' })
  }
}

export const getUbicaciones = async (req: Request, res: Response) => {
  try {
    // Concatenamos Sección + Estante para mostrar algo útil en el select
    const [rows] = await pool.query(`
      SELECT ubicacion_id, 
      CONCAT(seccion, ' - ', COALESCE(estante, 'General')) as nombre 
      FROM Ubicaciones 
      ORDER BY seccion ASC
    `)
    res.json(rows)
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener ubicaciones' })
  }
}

// --- 2. CRUD DE PRODUCTOS ---

// Buscar un producto por ID
export const getProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const [rows] = await pool.query<RowDataPacket[]>(
      'SELECT * FROM Productos WHERE producto_id = ?',
      [id],
    )

    if (rows.length === 0) {
      res.status(404).json({ message: 'Producto no encontrado' })
      return
    }

    // Convertimos el 1/0 de MySQL a true/false para el frontend
    const producto = rows[0]
    producto.requiere_receta = Boolean(producto.requiere_receta)

    res.json(producto)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al buscar producto' })
  }
}

// Crear nuevo producto
export const createProducto = async (req: Request, res: Response) => {
  try {
    const {
      nombre,
      concentracion,
      formato,
      categoria_id,
      laboratorio_id,
      ubicacion_id,
      requiere_receta,
    } = req.body

    // Validación básica
    if (!nombre || !categoria_id) {
      res.status(400).json({ message: 'Nombre y Categoría son obligatorios' })
      return
    }

    const query = `
      INSERT INTO Productos 
      (nombre, concentracion, formato, categoria_id, laboratorio_id, ubicacion_id, requiere_receta)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `

    const [result] = await pool.query<ResultSetHeader>(query, [
      nombre,
      concentracion || null,
      formato || null,
      categoria_id,
      laboratorio_id || null,
      ubicacion_id || null,
      requiere_receta ? 1 : 0,
    ])

    res.status(201).json({
      message: 'Producto creado',
      producto_id: result.insertId,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al guardar producto' })
  }
}

// Actualizar producto existente
export const updateProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const {
      nombre,
      concentracion,
      formato,
      categoria_id,
      laboratorio_id,
      ubicacion_id,
      requiere_receta,
    } = req.body

    const query = `
      UPDATE Productos 
      SET nombre=?, concentracion=?, formato=?, categoria_id=?, 
          laboratorio_id=?, ubicacion_id=?, requiere_receta=?
      WHERE producto_id = ?
    `

    const [result] = await pool.query<ResultSetHeader>(query, [
      nombre,
      concentracion,
      formato,
      categoria_id,
      laboratorio_id,
      ubicacion_id,
      requiere_receta ? 1 : 0,
      id,
    ])

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Producto no encontrado para actualizar' })
      return
    }

    res.json({ message: 'Producto actualizado correctamente' })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al actualizar producto' })
  }
}

// Eliminar producto
export const deleteProducto = async (req: Request, res: Response) => {
  try {
    const { id } = req.params

    const [result] = await pool.query<ResultSetHeader>(
      'DELETE FROM Productos WHERE producto_id = ?',
      [id],
    )

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Producto no encontrado' })
      return
    }

    res.json({ message: 'Producto eliminado' })
  } catch (error: any) {
    // Manejar error de llave foránea (Si el producto ya tiene lotes o ventas)
    if (error.code === 'ER_ROW_IS_REFERENCED_2') {
      res
        .status(409)
        .json({ message: 'No se puede eliminar: El producto tiene historial de lotes o ventas.' })
      return
    }
    console.error(error)
    res.status(500).json({ message: 'Error al eliminar producto' })
  }
}

export const getAllProductos = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        p.producto_id, 
        p.nombre, 
        p.concentracion, 
        p.formato, 
        p.requiere_receta,
        c.nombre AS categoria,
        l.nombre AS laboratorio,
        CONCAT(COALESCE(u.seccion, ''), ' - ', COALESCE(u.estante, '')) AS ubicacion,

        -- 1. OBTENER STOCK TOTAL
        COALESCE((
          SELECT SUM(cantidad_stock) 
          FROM lotes_producto 
          WHERE producto_id = p.producto_id
        ), 0) AS stock_total,

        -- 2. OBTENER PRECIO DE VENTA (LÓGICA MEJORADA)
        COALESCE(
          -- Opción A: Precio del lote activo más antiguo (lo que se está vendiendo ahora)
          (SELECT precio_venta 
           FROM lotes_producto 
           WHERE producto_id = p.producto_id AND cantidad_stock > 0 
           ORDER BY fecha_vencimiento ASC 
           LIMIT 1),
           
          -- Opción B: Si NO hay stock, usar el precio del último lote registrado (para que no salga 0.00)
          (SELECT precio_venta 
           FROM lotes_producto 
           WHERE producto_id = p.producto_id 
           ORDER BY fecha_vencimiento DESC 
           LIMIT 1),
           
          -- Opción C: Si nunca ha habido lotes, entonces sí es 0.00
          0.00
        ) AS precio_venta

      FROM Productos p
      LEFT JOIN Categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN Laboratorios l ON p.laboratorio_id = l.laboratorio_id
      LEFT JOIN Ubicaciones u ON p.ubicacion_id = u.ubicacion_id
      ORDER BY p.nombre ASC
    `

    const [rows] = await pool.query(query)

    const productos = (rows as any[]).map((p) => ({
      ...p,
      requiere_receta: Boolean(p.requiere_receta),
      stock_total: Number(p.stock_total),
      precio_venta: Number(p.precio_venta),
    }))

    res.json(productos)
  } catch (error) {
    console.error('Error en getAllProductos:', error)
    res.status(500).json({ message: 'Error al listar productos' })
  }
}
