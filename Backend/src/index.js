'use strict'
require('dotenv').config()

const express        = require('express')
const http           = require('http')
const cors           = require('cors')
const { Server }     = require('socket.io')
const { initDB }     = require('./config/db')
const socketService  = require('./services/socketService')
const { startPolling, stopPolling } = require('./services/blynkPoller')
const sensorRoutes   = require('./routes/sensorRoutes')
const controlRoutes  = require('./routes/controlRoutes')
const webhookRoutes  = require('./routes/webhookRoutes')

const PORT   = parseInt(process.env.PORT) || 3001
const ORIGIN = process.env.FRONTEND_URL   || 'http://localhost:5173'

const app    = express()
const server = http.createServer(app)

// ── Middleware ────────────────────────────────────────
app.use(cors({
  origin:      ORIGIN,
  methods:     ['GET', 'POST', 'OPTIONS'],
  credentials: true,
}))
app.use(express.json())
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`)
  next()
})

// ── Socket.io ─────────────────────────────────────────
const io = new Server(server, {
  cors:       { origin: ORIGIN, methods: ['GET', 'POST'] },
  transports: ['websocket', 'polling'],
})

io.on('connection', (socket) => {
  console.log(`[Socket] ✅ Connected    id:${socket.id} | total:${io.engine.clientsCount}`)
  socket.on('disconnect', (reason) => {
    console.log(`[Socket] ❌ Disconnected id:${socket.id} | ${reason}`)
  })
})

// ── Routes ────────────────────────────────────────────
app.use('/api/sensors',   sensorRoutes)
app.use('/api/control',   controlRoutes)
app.use('/blynk/webhook', webhookRoutes)

app.get('/health', (_req, res) => res.json({
  status:    'ok',
  mode:      '🔵 BLYNK LIVE',
  uptime:    Math.floor(process.uptime()) + 's',
  timestamp: new Date().toISOString(),
  clients:   io.engine.clientsCount,
}))

app.use((req, res) => {
  res.status(404).json({ error: `Not found: ${req.method} ${req.path}` })
})

// ── Startup ───────────────────────────────────────────
async function start() {
  console.log('\n🔵 IoT Dashboard Backend — BLYNK MODE')
  console.log('═══════════════════════════════════════')

  try {
    console.log('📦 Step 1/3 — Connecting PostgreSQL...')
    await initDB()

    console.log('🔌 Step 2/3 — Initializing Socket.io...')
    socketService.init(io)

    console.log('🔵 Step 3/3 — Starting Blynk poller...')
    startPolling()

    server.listen(PORT, () => {
      console.log('═══════════════════════════════════════')
      console.log(`✅  Server   → http://localhost:${PORT}`)
      console.log(`🔍  Health   → http://localhost:${PORT}/health`)
      console.log(`📊  Latest   → http://localhost:${PORT}/api/sensors/latest`)
      console.log(`📋  History  → http://localhost:${PORT}/api/sensors/history`)
      console.log(`🎛️  Control  → http://localhost:${PORT}/api/control/[power|fan|lights]`)
      console.log(`🪝  Webhook  → http://localhost:${PORT}/blynk/webhook`)
      console.log('═══════════════════════════════════════\n')
    })

  } catch (err) {
    console.error('\n❌ STARTUP FAILED:', err.message)
    console.error('\n📋 Checklist:')
    console.error('  1. PostgreSQL running?')
    console.error('  2. Database exists?       → createdb oven_dashboard')
    console.error('  3. .env correct?          → Check DATABASE_URL')
    console.error('  4. BLYNK_AUTH_TOKEN set?  → Check .env')
    console.error('  5. npm install done?      → npm install\n')
    process.exit(1)
  }
}

// ── Graceful Shutdown ─────────────────────────────────
function shutdown(signal) {
  console.log(`\n${signal} — shutting down...`)
  stopPolling()
  server.close(() => { process.exit(0) })
  setTimeout(() => process.exit(1), 5000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))
process.on('unhandledRejection', (r) => console.error('⚠️ Unhandled:', r))
process.on('uncaughtException',  (e) => console.error('⚠️ Uncaught:', e.message))

start()
