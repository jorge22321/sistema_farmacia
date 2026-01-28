// backend/database/database.ts
import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Configuramos dotenv aquí también por si este archivo se llama independientemente
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, '../.env') })

// Configuración del Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
  waitForConnections: true,
  connectionLimit: 10, // Máximo de conexiones simultáneas
  queueLimit: 0,
})

// Probamos la conexión al iniciar (Opcional, pero bueno para debug)
pool
  .getConnection()
  .then((connection) => {
    pool.releaseConnection(connection)
    console.log('✅ Base de datos MySQL conectada exitosamente')
  })
  .catch((err) => {
    console.error('❌ Error conectando a la base de datos:', err.message)
  })

export default pool
