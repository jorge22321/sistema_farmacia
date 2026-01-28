//src/backend/controllers/recetaController.ts
import { Request, Response } from 'express'
import pool from '../database/database'
import { ResultSetHeader, RowDataPacket } from 'mysql2'

// --- OBTENER RECETAS PENDIENTES ---
export const getRecetasPendientes = async (req: Request, res: Response) => {
  try {
    // Buscamos recetas donde las repeticiones restantes sean > 0
    const query = `
      SELECT 
        r.receta_id as id,
        CONCAT(c.nombres, ' ', c.apellidos) as pacienteNombre,
        c.dni as pacienteDni,
        CONCAT(m.nombres, ' ', m.apellidos) as medicoNombre,
        m.cmp as medicoCmp,
        p.producto_id as medicamentoId,
        p.nombre as medicamentoNombre,
        p.concentracion,
        r.dosis as instrucciones,
        r.cantidad_recetada as cantidad,
        r.repeticiones_restantes,
        DATE_FORMAT(r.fecha_emision, '%Y-%m-%d') as fecha,
        -- Obtenemos el stock actual del producto
        COALESCE((SELECT SUM(cantidad_stock) FROM lotes_producto WHERE producto_id = p.producto_id), 0) as stockDisponible
      FROM Recetas r
      INNER JOIN Clientes c ON r.cliente_id = c.cliente_id
      INNER JOIN Medicos m ON r.medico_id = m.medico_id
      INNER JOIN Productos p ON r.producto_id = p.producto_id
      WHERE r.repeticiones_restantes > 0
      ORDER BY r.fecha_emision DESC
    `
    const [rows] = await pool.query(query)
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener recetas pendientes' })
  }
}

// --- CREAR NUEVA RECETA ---
export const createReceta = async (req: Request, res: Response) => {
  const connection = await pool.getConnection()
  try {
    const {
      pacienteNombre,
      pacienteApellido,
      pacienteDni,
      pacienteFecNac,
      pacienteTel,
      pacienteDir,
      medicoNombre,
      medicoApellido,
      medicoCmp,
      medicoEspecialidad,
      medicamentoId,
      instrucciones,
      cantidad,
      repeticiones,
    } = req.body

    await connection.beginTransaction()

    // 1. GESTIONAR CLIENTE (PACIENTE)
    // Verificamos si existe por DNI, si no, lo creamos
    let cliente_id: number
    const [clientes] = await connection.query<RowDataPacket[]>(
      'SELECT cliente_id FROM Clientes WHERE dni = ?',
      [pacienteDni],
    )

    if (clientes.length > 0) {
      cliente_id = clientes[0].cliente_id
      // Opcional: Actualizar datos si vinieron nuevos
    } else {
      const [newCliente] = await connection.query<ResultSetHeader>(
        'INSERT INTO Clientes (nombres, apellidos, dni, fecha_nacimiento, telefono, direccion) VALUES (?, ?, ?, ?, ?, ?)',
        [
          pacienteNombre,
          pacienteApellido,
          pacienteDni,
          pacienteFecNac || null,
          pacienteTel || null,
          pacienteDir || null,
        ],
      )
      cliente_id = newCliente.insertId
    }

    // 2. GESTIONAR MÉDICO
    // Verificamos por CMP
    let medico_id: number
    const [medicos] = await connection.query<RowDataPacket[]>(
      'SELECT medico_id FROM Medicos WHERE cmp = ?',
      [medicoCmp],
    )

    if (medicos.length > 0) {
      medico_id = medicos[0].medico_id
    } else {
      const [newMedico] = await connection.query<ResultSetHeader>(
        'INSERT INTO Medicos (nombres, apellidos, cmp, especialidad) VALUES (?, ?, ?, ?)',
        [medicoNombre, medicoApellido, medicoCmp, medicoEspecialidad || 'General'],
      )
      medico_id = newMedico.insertId
    }

    // 3. CREAR LA RECETA
    await connection.query(
      `INSERT INTO Recetas 
      (cliente_id, medico_id, producto_id, fecha_emision, dosis, cantidad_recetada, repeticiones_total, repeticiones_restantes)
      VALUES (?, ?, ?, NOW(), ?, ?, ?, ?)`,
      [cliente_id, medico_id, medicamentoId, instrucciones, cantidad, repeticiones, repeticiones],
    )

    await connection.commit()
    res.status(201).json({ message: 'Receta registrada correctamente' })
  } catch (error) {
    await connection.rollback()
    console.error(error)
    res.status(500).json({ message: 'Error al registrar la receta' })
  } finally {
    connection.release()
  }
}

// --- ACTUALIZAR ESTADO (DISPENSAR) ---
// Nota: La dispensación real ocurre en Venta, aquí solo bajamos las repeticiones
export const marcarDispensada = async (req: Request, res: Response) => {
  const connection = await pool.getConnection()

  try {
    const { id } = req.params // receta_id
    const farmaceutico_id = (req as any).user?.id || 1

    await connection.beginTransaction()

    // 1. VERIFICAR LA RECETA
    const [recetas] = await connection.query<RowDataPacket[]>(
      'SELECT * FROM Recetas WHERE receta_id = ?',
      [id],
    )

    if (recetas.length === 0) {
      throw new Error('Receta no encontrada')
    }
    const receta = recetas[0]

    if (receta.repeticiones_restantes <= 0) {
      throw new Error('Esta receta ya no tiene repeticiones disponibles')
    }

    // 2. ACTUALIZAR LA RECETA (Restar repetición)
    // NO descontamos stock físico aquí, solo bajamos el contador de la receta.
    await connection.query(
      'UPDATE Recetas SET repeticiones_restantes = repeticiones_restantes - 1 WHERE receta_id = ?',
      [id],
    )

    // 3. REGISTRAR EN DISPENSACIONES (Versión Simplificada)
    // Ya NO enviamos detalle_id ni NULL. Solo guardamos el hecho administrativo.
    await connection.query(
      `INSERT INTO Dispensaciones 
       (receta_id, fecha_dispensacion, cantidad_dispensada, farmaceutico_id)
       VALUES (?, NOW(), ?, ?)`,
      [id, receta.cantidad_recetada, farmaceutico_id],
    )

    await connection.commit()

    // Respondemos con los datos para que el Frontend lo agregue al carrito
    res.json({
      message: 'Receta validada. Enviando a caja...',
      producto_id: receta.producto_id,
      cantidad: receta.cantidad_recetada,
    })
  } catch (error: any) {
    await connection.rollback()
    console.error(error)
    res.status(500).json({ message: error.message || 'Error al procesar la dispensación' })
  } finally {
    connection.release()
  }
}

export const getHistorialDispensaciones = async (req: Request, res: Response) => {
  try {
    const query = `
      SELECT 
        d.dispensacion_id as id,
        DATE_FORMAT(d.fecha_dispensacion, '%Y-%m-%d %H:%i') as fecha,
        CONCAT(c.nombres, ' ', c.apellidos) as paciente,
        p.nombre as producto,
        CONCAT(m.nombres, ' ', m.apellidos) as medico,
        d.cantidad_dispensada as cantidad,
        'dispensada' as estado 
      FROM Dispensaciones d
      INNER JOIN Recetas r ON d.receta_id = r.receta_id
      INNER JOIN Clientes c ON r.cliente_id = c.cliente_id
      INNER JOIN Productos p ON r.producto_id = p.producto_id
      INNER JOIN Medicos m ON r.medico_id = m.medico_id
      ORDER BY d.fecha_dispensacion DESC
    `
    const [rows] = await pool.query(query)
    res.json(rows)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Error al obtener el historial' })
  }
}
