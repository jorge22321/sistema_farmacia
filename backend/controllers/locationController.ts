//src/backend/controllers/locationController.ts
import { Request, Response } from 'express'
import pool from '../database/database' // Asegúrate de que esta ruta sea correcta
import { RowDataPacket } from 'mysql2'

// Interface para tipado
interface ProductoUbicacion extends RowDataPacket {
  id: number
  name: string
  category: string
  location_id: number | null
  seccion: string | null
  estante: string | null
  stock: number
}

// 1. Obtener productos con su ubicación y stock actual
export const obtenerProductosUbicacion = async (req: Request, res: Response) => {
  try {
    // Obtenemos filtros del query string
    const search = (req.query.search as string) || ''
    const category = (req.query.category as string) || 'Todos'

    // Consulta base: Unimos Productos con Ubicaciones y Categorías
    // Productos: producto_id, nombre, ubicacion_id
    // Ubicaciones: seccion, estante
    // Lotes_Producto: sumamos cantidad_stock
    let query = `
      SELECT 
        p.producto_id as id,
        p.nombre as name,
        c.nombre as category,
        p.ubicacion_id as location_id,
        u.seccion as seccion,
        u.estante as estante,
        COALESCE((SELECT SUM(lp.cantidad_stock) 
                  FROM Lotes_Producto lp 
                  WHERE lp.producto_id = p.producto_id 
                  AND lp.fecha_vencimiento >= CURDATE()), 0) as stock
      FROM Productos p
      LEFT JOIN Ubicaciones u ON p.ubicacion_id = u.ubicacion_id
      LEFT JOIN Categorias c ON p.categoria_id = c.categoria_id
      WHERE 1=1
    `

    const params: any[] = []

    // Aplicar filtro de búsqueda (Nombre)
    if (search) {
      query += ` AND p.nombre LIKE ?`
      params.push(`%${search}%`)
    }

    // Aplicar filtro de categoría
    if (category !== 'Todos' && category !== '') {
      query += ` AND c.nombre = ?`
      params.push(category)
    }

    query += ` ORDER BY p.nombre ASC`

    const [rows] = await pool.query<ProductoUbicacion[]>(query, params)

    // Formateamos para el frontend
    const response = rows.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      stock: row.stock,
      // Combinamos sección y estante para mostrar en UI
      location: row.location_id
        ? {
            id: row.location_id,
            shelf: row.estante, // Mapeamos 'estante' a 'shelf'
            column: row.seccion, // Usamos 'sección' como 'column' o contexto
          }
        : null,
    }))

    res.json(response)
  } catch (error) {
    console.error('Error al obtener productos y ubicaciones:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// 2. Obtener lista simple de ubicaciones disponibles (para el Dropdown del Modal)
export const obtenerListaUbicaciones = async (req: Request, res: Response) => {
  try {
    // IMPORTANTE: Aquí asumimos que en tu BD la columna es 'seccion' (sin tilde),
    // igual que corregimos en la otra función.
    const query = 'SELECT ubicacion_id, seccion, estante FROM Ubicaciones'

    // Si tuvieras la tilde en la base de datos, la línea sería:
    // const query = 'SELECT ubicacion_id, sección as seccion, estante FROM Ubicaciones';

    const [rows] = await pool.query(query)
    res.json(rows)
  } catch (error: any) {
    // Esto mostrará el error real en tu terminal del backend (la negra)
    console.error('❌ Error CRÍTICO en obtenerListaUbicaciones:', error.sqlMessage || error.message)

    res.status(500).json({
      message: 'Error al cargar la lista de ubicaciones',
      error: error.sqlMessage || error.message,
    })
  }
}

// 3. Actualizar la ubicación de un producto específico
export const actualizarUbicacionProducto = async (req: Request, res: Response) => {
  const { id } = req.params // producto_id
  const { ubicacion_id } = req.body // Nuevo ID de ubicación

  try {
    // Actualizamos FK ubicacion_id en tabla Productos
    await pool.query('UPDATE Productos SET ubicacion_id = ? WHERE producto_id = ?', [
      ubicacion_id,
      id,
    ])

    res.json({ message: 'Ubicación actualizada correctamente' })
  } catch (error) {
    console.error('Error actualizando ubicación:', error)
    res.status(500).json({ message: 'Error al actualizar ubicación' })
  }
}

export const crearUbicacion = async (req: Request, res: Response) => {
  const { section, shelves } = req.body // Esperamos: { section: "Bodega", shelves: ["E1", "E2"] }

  if (!section || !shelves || !Array.isArray(shelves) || shelves.length === 0) {
    return res.status(400).json({ message: 'Datos incompletos. Se requiere sección y estantes.' })
  }

  const connection = await pool.getConnection()

  try {
    await connection.beginTransaction()

    // Insertamos cada estante asociado a esa sección
    for (const shelf of shelves) {
      if (shelf.trim() !== '') {
        // NOTA: Ajusta 'seccion' o 'sección' según tu base de datos (aquí uso sin tilde por seguridad)
        await connection.query('INSERT INTO Ubicaciones (seccion, estante) VALUES (?, ?)', [
          section,
          shelf,
        ])
      }
    }

    await connection.commit()
    res.json({ message: 'Ubicaciones creadas exitosamente' })
  } catch (error: any) {
    await connection.rollback()
    console.error('Error creando ubicación:', error)
    res.status(500).json({ message: 'Error al crear ubicación', error: error.message })
  } finally {
    connection.release()
  }
}
