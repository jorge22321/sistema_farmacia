//src/backend/server.ts
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
// Librerías nativas de Node con prefijo 'node:' (Best Practice)
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import pool from './database/database.ts' // <--- Importamos la DB

// --- SOLO UNA IMPORTACIÓN DE RUTAS ---
import routerAPI from './routes/router.ts'
// --- CONFIGURACIÓN DE ENTORNOS Y RUTAS ---
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, '.env') })

const app = express()
const PORT = process.env.PORT || 3000

// --- MIDDLEWARES ---
app.use(cors())
app.use(express.json())

// --- RUTAS API ---
app.get('/api/ping', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend funcionando correctamente',
    timestamp: new Date().toISOString(),
  })
})

// --- CONECTAR EL HUB DE RUTAS ---
app.use('/api', routerAPI)
// --- SERVIR FRONTEND (Producción) ---
const distPath = path.resolve(__dirname, '../dist')

// Servir archivos estáticos
app.use(express.static(distPath))

// --- CORRECCIÓN CRÍTICA AQUÍ ---
// En Express 5, '*' como string lanza error.
// Usamos una Expresión Regular /(.*)/ para capturar cualquier ruta no manejada.
app.get(/(.*)/, (req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'))
})

// --- ARRANQUE ---
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en: http://localhost:${PORT}`)
  console.log(`📂 Sirviendo frontend desde: ${distPath}`)
})
