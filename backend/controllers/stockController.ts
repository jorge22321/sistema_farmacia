// backend/controllers/stockController.ts
import { Request, Response } from 'express'
import pool from '../database/database'

export const obtenerControlStock = async (req: Request, res: Response) => {
  try {
    console.log('--> 🚀 Iniciando cálculo de stock (Versión Corregida)...')

    const [rows] = await pool.query(`
      SELECT 
        p.producto_id, 
        p.nombre, 
        p.concentracion, 
        p.formato, 
        
        -- ⚠️ CORRECCIÓN IMPORTANTE:
        -- Según el diccionario, la tabla Productos NO tiene 'stock_minimo'.
        -- Para que el sistema funcione, definimos 10 como mínimo por defecto para todos.
        10 AS stock_minimo,

        c.categoria_id, 
        c.nombre AS categoria_nombre,
        lab.laboratorio_id, 
        lab.nombre AS laboratorio_nombre,
        
        -- ✅ CÁLCULO DE STOCK REAL:
        -- Sumamos la 'cantidad_stock' de la tabla 'Lotes_Producto' (alias lp)
        COALESCE(SUM(lp.cantidad_stock), 0) as stock_actual,
        
        -- Datos del lote más próximo a vencer (Lógica FIFO para alertas)
        (SELECT numero_lote FROM Lotes_Producto WHERE producto_id = p.producto_id AND cantidad_stock > 0 ORDER BY fecha_vencimiento ASC LIMIT 1) as lote_num,
        (SELECT fecha_vencimiento FROM Lotes_Producto WHERE producto_id = p.producto_id AND cantidad_stock > 0 ORDER BY fecha_vencimiento ASC LIMIT 1) as lote_fec,
        (SELECT cantidad_stock FROM Lotes_Producto WHERE producto_id = p.producto_id AND cantidad_stock > 0 ORDER BY fecha_vencimiento ASC LIMIT 1) as lote_cant

      FROM Productos p
      LEFT JOIN Categorias c ON p.categoria_id = c.categoria_id
      LEFT JOIN Laboratorios lab ON p.laboratorio_id = lab.laboratorio_id
      -- Aquí unimos con la tabla donde vive el stock real:
      LEFT JOIN Lotes_Producto lp ON p.producto_id = lp.producto_id
      
      GROUP BY 
        p.producto_id, p.nombre, p.concentracion, p.formato,
        c.categoria_id, c.nombre, lab.laboratorio_id, lab.nombre
    `)

    // Protección para evitar errores si la consulta falla o viene vacía
    const resultados = Array.isArray(rows) ? (rows as any[]) : []

    console.log(`--> ✅ Consulta exitosa. Se procesaron ${resultados.length} productos.`)

    // Estructura de respuesta para el Frontend
    const respuesta = {
      criticos: [] as any[],
      bajos: [] as any[],
      normales: [] as any[],
    }

    resultados.forEach((row) => {
      // Convertimos a números para asegurar que las comparaciones ( <, > ) funcionen bien
      const stockActual = Number(row.stock_actual)
      const stockMinimo = Number(row.stock_minimo)

      const producto = {
        producto_id: row.producto_id,
        nombre: row.nombre,
        concentracion: row.concentracion,
        formato: row.formato,
        categoria: {
          id: row.categoria_id,
          nombre: row.categoria_nombre || 'Sin Categoría',
        },
        laboratorio: {
          id: row.laboratorio_id,
          nombre: row.laboratorio_nombre || 'Sin Laboratorio',
        },
        stock_actual: stockActual,
        stock_minimo: stockMinimo,
        lote_proximo_vencer: row.lote_num
          ? {
              numero_lote: row.lote_num,
              fecha_vencimiento: row.lote_fec,
              cantidad: row.lote_cant,
            }
          : null,
      }

      // Clasificación de Alertas
      if (stockActual <= 0) {
        respuesta.criticos.push(producto)
      } else if (stockActual < stockMinimo) {
        respuesta.bajos.push(producto)
      } else {
        respuesta.normales.push(producto)
      }
    })

    res.json(respuesta)
  } catch (error) {
    console.error('--> ❌ ERROR FATAL EN CONTROL STOCK:', error)
    // Devolvemos estructura vacía en caso de error para no romper el frontend
    res.status(500).json({ criticos: [], bajos: [], normales: [] })
  }
}
