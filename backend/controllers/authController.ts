import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import pool from '../database/database'
import jwt from 'jsonwebtoken'

// ✅ REGISTRO: Compatible con la tabla Empleados del PDF v2
export const registrarEmpleado = async (req: Request, res: Response) => {
  try {
    // Recibimos 'correo' porque ahora sí existe en la BD v2
    const { nombreCompleto, correo, usuario, contrasena } = req.body

    if (!nombreCompleto || !correo || !usuario || !contrasena) {
      res.status(400).json({ message: 'Faltan datos obligatorios' })
      return
    }

    // Dividir nombre (Lógica simple para llenar nombres/apellidos)
    const partesNombre = nombreCompleto.split(' ')
    const nombres = partesNombre[0]
    const apellidos = partesNombre.slice(1).join(' ') || 'Pendiente'

    const salt = await bcrypt.genSalt(10)
    const claveHash = await bcrypt.hash(contrasena, salt)

    // INSERTAMOS 'correo' y 'usuario' según PDF v2
    const query = `
      INSERT INTO Empleados (nombres, apellidos, correo, usuario, clave_hash, role_id, esta_activo)
      VALUES (?, ?, ?, ?, ?, 1, 1) 
    `
    // Nota: role_id = 1 (Asumimos Admin por defecto) y esta_activo = 1 (True)

    const [result]: any = await pool.query(query, [nombres, apellidos, correo, usuario, claveHash])

    res.status(201).json({
      message: 'Empleado registrado exitosamente',
      empleadoId: result.insertId,
    })
  } catch (error: any) {
    console.error('Error en registro:', error)
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(409).json({ message: 'El usuario o correo ya existe' })
      return
    }
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}

// ✅ LOGIN: Con validación de seguridad extra
export const login = async (req: Request, res: Response) => {
  try {
    const { usuario, contrasena } = req.body

    if (!usuario || !contrasena) {
      res.status(400).json({ message: 'Usuario y contraseña obligatorios' })
      return
    }

    // 1. Buscamos el empleado, incluyendo su rol y estado
    // Hacemos JOIN para enviar el NOMBRE del rol al frontend (ej: "Administrador")
    const query = `
      SELECT e.*, r.nombre_rol 
      FROM Empleados e
      INNER JOIN Roles r ON e.role_id = r.role_id
      WHERE e.usuario = ?
    `
    const [rows]: any = await pool.query(query, [usuario])

    if (rows.length === 0) {
      res.status(401).json({ message: 'Credenciales inválidas' })
      return
    }

    const empleado = rows[0]

    // 🛡️ SEGURIDAD CRÍTICA: Verificar si está activo
    // El diccionario dice que 'esta_activo' define si puede usar el sistema
    if (!empleado.esta_activo) {
      res.status(403).json({ message: 'Usuario inactivo. Contacte al administrador.' })
      return
    }

    // 2. Verificar contraseña
    const passwordEsCorrecta = await bcrypt.compare(contrasena, empleado.clave_hash)

    if (!passwordEsCorrecta) {
      res.status(401).json({ message: 'Credenciales inválidas' })
      return
    }

    // 3. Generar Token
    const token = jwt.sign(
      {
        id: empleado.empleado_id,
        rol: empleado.nombre_rol, // Enviamos el nombre (ej: 'Farmacéutico') es más útil
        role_id: empleado.role_id, // También el ID por si acaso
      },
      process.env.JWT_SECRET as string,
      { expiresIn: '8h' },
    )

    // 4. Responder
    res.json({
      message: 'Bienvenido',
      token,
      usuario: {
        nombre: empleado.nombres,
        correo: empleado.correo, // ✅ Dato disponible gracias a tu PDF v2
        rol: empleado.nombre_rol, // "Administrador", etc.
      },
    })
  } catch (error) {
    console.error('Error en login:', error)
    res.status(500).json({ message: 'Error interno del servidor' })
  }
}
