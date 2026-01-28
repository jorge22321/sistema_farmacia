import { Request, Response } from 'express'
import pool from '../database/database'
import { RowDataPacket, ResultSetHeader } from 'mysql2'

// --- 1. PROCESAR VENTA (Crear) ---
export const procesarVenta = async (req: Request, res: Response) => {
  const connection = await pool.getConnection()

  try {
    const { items, metodo_id, total } = req.body
    const empleado_id = (req as any).user?.id || 1

    await connection.beginTransaction()

    // 1. Crear la Venta (Cabecera)
    const [ventaResult] = await connection.query<ResultSetHeader>(
      'INSERT INTO Ventas (empleado_id, fecha_venta, monto_total, metodo_id) VALUES (?, NOW(), ?, ?)',
      [empleado_id, total, metodo_id],
    )
    const venta_id = ventaResult.insertId

    // 2. Procesar cada producto (Detalle)
    for (const item of items) {
      let cantidadRestante = item.cantidad
      const producto_id = item.producto_id

      // BUSCAR LOTES DISPONIBLES (FEFO)
      const [lotes] = await connection.query<RowDataPacket[]>(
        `SELECT lote_id, numero_lote, cantidad_stock, fecha_vencimiento 
         FROM Lotes_Producto 
         WHERE producto_id = ? AND cantidad_stock > 0 
         ORDER BY fecha_vencimiento ASC`,
        [producto_id],
      )

      for (const lote of lotes) {
        if (cantidadRestante <= 0) break

        const cantidadAUsar = Math.min(lote.cantidad_stock, cantidadRestante)

        // Insertar Detalle - CORREGIDO SEGÚN DICCIONARIO
        // Usamos 'cantidad_vendida' y 'precio_venta_final'.
        // Quitamos 'subtotal' porque no está en la tabla Detalle_Venta.
        await connection.query(
          `INSERT INTO Detalle_Venta (venta_id, lote_id, cantidad_vendida, precio_venta_final)
           VALUES (?, ?, ?, ?)`,
          [venta_id, lote.lote_id, cantidadAUsar, item.precio_venta],
        )

        // Actualizar Stock del Lote
        await connection.query(
          'UPDATE Lotes_Producto SET cantidad_stock = cantidad_stock - ? WHERE lote_id = ?',
          [cantidadAUsar, lote.lote_id],
        )

        cantidadRestante -= cantidadAUsar
      }

      if (cantidadRestante > 0) {
        throw new Error(`Stock insuficiente para el producto ID: ${producto_id}`)
      }
    }

    await connection.commit()
    res.status(201).json({ message: 'Venta exitosa', venta_id })
  } catch (error: any) {
    await connection.rollback()
    console.error(error)
    res.status(500).json({ message: error.message || 'Error al procesar la venta' })
  } finally {
    connection.release()
  }
}

// --- 2. OBTENER HISTORIAL (Leer) ---
export const getHistorialVentas = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        v.venta_id,
        DATE_FORMAT(v.fecha_venta, '%Y-%m-%d') as fecha_venta,
        DATE_FORMAT(v.fecha_venta, '%H:%i') as hora_venta,
        v.monto_total,
        mp.nombre as metodo_pago, 
        CONCAT(e.nombres, ' ', e.apellidos) as empleado
      FROM Ventas v
      INNER JOIN Empleados e ON v.empleado_id = e.empleado_id
      INNER JOIN metodos_pago mp ON v.metodo_id = mp.metodo_id
      ORDER BY v.fecha_venta DESC
    `

    const [rows] = await pool.query(query)
    res.json(rows)
  } catch (error: any) {
    console.error(error)
    res.status(500).json({ message: error.sqlMessage || 'Error al obtener el reporte de ventas' })
  }
}
