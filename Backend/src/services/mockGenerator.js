'use strict'

const SensorLog     = require('../models/SensorLog')
const socketService = require('./socketService')
require('dotenv').config()

const INTERVAL_MS = parseInt(process.env.MOCK_INTERVAL_MS) || 2000

/*
  Mock Temperature Simulation
  ─────────────────────────────────────────
  Simulates a realistic drying cycle:

  Phase 1 — Heating up    (0–10 min)  : 40°C → 75°C  (rising)
  Phase 2 — Stable drying (10–50 min) : 70–80°C       (fluctuating)
  Phase 3 — Cooling down  (50–60 min) : 75°C → 45°C  (falling)

  Uses a sine wave + noise to make it look natural, not flat.
*/

let tick       = 0
let mockTimer  = null
let genCount   = 0

function generateTemp() {
  const secondsElapsed = (tick * INTERVAL_MS) / 1000
  const minutesElapsed = secondsElapsed / 60

  let baseTemp

  if (minutesElapsed < 10) {
    // Phase 1: Heating  40°C → 75°C
    baseTemp = 40 + (minutesElapsed / 10) * 35

  } else if (minutesElapsed < 50) {
    // Phase 2: Stable drying 70–80°C with sine wave fluctuation
    baseTemp = 75 + Math.sin(secondsElapsed * 0.05) * 4

  } else if (minutesElapsed < 60) {
    // Phase 3: Cooling  75°C → 45°C
    baseTemp = 75 - ((minutesElapsed - 50) / 10) * 30

  } else {
    // Cycle restarts
    tick = 0
    baseTemp = 40
  }

  const noise = (Math.random() - 0.5) * 1.0
  return Math.round((baseTemp + noise) * 100) / 100
}

async function runCycle() {
  try {
    const temp  = generateTemp()
    const saved = await SensorLog.insert(temp)

    socketService.emit('sensor_update', saved)

    tick++
    genCount++

    if (genCount % 10 === 0) {
      console.log(
        `[${new Date().toLocaleTimeString()}] ` +
        `Mock #${genCount} | ` +
        `Temp: ${temp}°C | ` +
        `Clients: ${socketService.getConnectedCount()}`
      )
    }

  } catch (err) {
    console.error('[Mock Error]', err.message)
  }
}

function startMock() {
  console.log('🎭 Mock data generator starting...')
  console.log(`   Interval  : every ${INTERVAL_MS}ms`)
  console.log('   Simulates : Heating → Stable → Cooling cycle')
  console.log('   Temp range: 40°C – 80°C with realistic fluctuation\n')

  runCycle()
  mockTimer = setInterval(runCycle, INTERVAL_MS)
}

function stopMock() {
  if (mockTimer) {
    clearInterval(mockTimer)
    mockTimer = null
    console.log('🛑 Mock generator stopped')
  }
}

module.exports = { startMock, stopMock }
