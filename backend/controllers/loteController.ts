import { Request, Response } from 'express'
import pool from '../database/database'
import { ResultSetHeader } from 'mysql2'

export const createLote = async (req: Request, res: Response) => {
  try {
    const {
      producto_id,
      numero_lote,
      fecha_vencimiento,
      cantidad_stock,
      precio_costo,
      precio_venta,
    } = req.body

    // 1. Validaciones
    if (!producto_id || !numero_lote || !fecha_vencimiento || !cantidad_stock) {
      res.status(400).json({ message: 'Faltan datos obligatorios' })
      return
    }

    // 2. Insertar en Base de Datos
    // Nota: Guardamos stock_inicial para registro histórico y stock_actual para las ventas
    const query = `
      INSERT INTO lotes_producto
      (producto_id, numero_lote, fecha_vencimiento, cantidad_stock, precio_costo, precio_venta)
      VALUES (?, ?, ?, ?, ?, ?)
    `

    // Asumimos que precio_costo del front es precio_compra en la DB
    await pool.query<ResultSetHeader>(query, [
      producto_id,
      numero_lote,
      fecha_vencimiento,
      cantidad_stock,
      cantidad_stock, // Al inicio, el stock actual es igual al inicial
      precio_costo,
      precio_venta,
    ])

    // 3. (Opcional) Actualizar stock total en la tabla Productos si tienes un campo acumulador
    // await pool.query('UPDATE Productos SET stock_total = stock_total + ? WHERE producto_id = ?', [cantidad_stock, producto_id])

    res.status(201).json({ message: 'Lote registrado exitosamente' })
  } catch (error: any) {
    console.error(error)
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'Ya existe un lote con ese número para este producto.' })
      return
    }
    res.status(500).json({ message: 'Error interno al guardar lote' })
  }
}

export const getLotes = async (req: Request, res: Response) => {
  try {
    // CORRECCIÓN: Seleccionamos las columnas que SÍ existen en tu tabla actual
    // Si tu tabla tiene 'cantidad_stock', la llamamos así.
    const query = `
      SELECT 
        l.lote_id,
        p.nombre AS producto_nombre,
        p.concentracion,
        l.numero_lote,
        DATE_FORMAT(l.fecha_vencimiento, '%Y-%m-%d') as fecha_vencimiento,
        l.cantidad_stock, 
        l.precio_costo,
        l.precio_venta
      FROM lotes_producto l
      INNER JOIN Productos p ON l.producto_id = p.producto_id
      ORDER BY l.fecha_vencimiento ASC
    `

    const [rows] = await pool.query(query)
    res.json(rows)
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: error.sqlMessage || 'Error al obtener lotes' })
  }
}

export const obtenerLotesPorVencer = async (req: Request, res: Response) => {
  try {
    // CORRECCIÓN BASADA EN EL DICCIONARIO:
    // 1. Cambiamos 'p.precio_venta' por 'l.precio_venta'
    // 2. Mantenemos el JOIN correcto entre lotes y productos
    const [rows] = await pool.query(`
      SELECT 
        l.lote_id, 
        p.nombre AS producto_nombre, 
        p.concentracion, 
        l.numero_lote, 
        l.fecha_vencimiento, 
        l.cantidad_stock,
        l.precio_venta  -- <--- CORREGIDO: El precio viene del lote (alias 'l'), no del producto
      FROM Lotes_Producto l
      INNER JOIN Productos p ON l.producto_id = p.producto_id
      WHERE l.cantidad_stock > 0
      ORDER BY l.fecha_vencimiento ASC
    `)

    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener lotes' })
  }
}
