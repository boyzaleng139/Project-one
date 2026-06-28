'use strict'
require('dotenv').config()

// IMPORTANT: Must use node-fetch v2 (CommonJS compatible).
// If this line throws "Error [ERR_REQUIRE_ESM]", run:
//   npm uninstall node-fetch && npm install node-fetch@2
let fetch
try {
  fetch = require('node-fetch')
} catch (err) {
  console.error('❌ node-fetch not found. Run: npm install node-fetch@2')
  process.exit(1)
}

const SensorLog     = require('../models/SensorLog')
const socketService = require('./socketService')

const TOKEN       = process.env.BLYNK_AUTH_TOKEN
const BASE_URL    = process.env.BLYNK_BASE_URL || 'https://blynk.cloud/external/api'
const INTERVAL_MS = parseInt(process.env.POLL_INTERVAL_MS) || 2000

// ── Runtime counters ──────────────────────────────────────────────────────────
let pollTimer  = null
let pollCount  = 0
let errorCount = 0
const MAX_LOG_ERRORS = 5   // suppress repeated error logs after this threshold

// ── Core fetch ────────────────────────────────────────────────────────────────

/**
 * Fetch temperature from Blynk virtual pin V1.
 * Blynk returns a plain string for a single pin: e.g. "68.50"
 *
 * @returns {Promise<number>} temperature value in °C
 */
async function fetchTemp() {
  const url = `${BASE_URL}/get?token=${TOKEN}&V10`

  const response = await fetch(url, {
    method:  'GET',
    timeout: 5000,
  })

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('Blynk: Invalid token or device offline (HTTP 400)')
    }
    if (response.status === 401) {
      throw new Error('Blynk: Unauthorized — check BLYNK_AUTH_TOKEN (HTTP 401)')
    }
    throw new Error(`Blynk API error: ${response.status} ${response.statusText}`)
  }

  // Strip surrounding quotes Blynk sometimes adds: `"68.50"` → `68.50`
  const text    = await response.text()
  const cleaned = text.replace(/"/g, '').trim()
  const temp    = parseFloat(cleaned)

  if (isNaN(temp)) {
    throw new Error(`Blynk returned non-numeric value: "${text}"`)
  }

  // Sanity-check: plausible temperature range for a hot-air dryer
  if (temp < -50 || temp > 500) {
    throw new Error(`Temperature out of plausible range: ${temp}°C`)
  }

  return Math.round(temp * 100) / 100   // store with 2 decimal places
}

// ── Poll cycle ────────────────────────────────────────────────────────────────

/**
 * Execute one complete poll cycle:
 *   1. GET V1 from Blynk
 *   2. INSERT into PostgreSQL
 *   3. Emit 'sensor_update' to all React clients
 *
 * All errors are caught and logged; a failed cycle never stops the interval.
 *
 * @returns {Promise<void>}
 */
async function runPollCycle() {
  try {
    const temp  = await fetchTemp()
    const saved = await SensorLog.insert(temp)
    socketService.emit('sensor_update', saved)

    pollCount++
    errorCount = 0   // reset streak on success

    // Print a summary every 10 cycles (~20 s) to avoid console spam
    if (pollCount % 10 === 0) {
      console.log(
        `[${new Date().toLocaleTimeString()}] ` +
        `Poll #${pollCount} | ` +
        `Temp: ${temp}°C | ` +
        `Clients: ${socketService.getConnectedCount()}`
      )
    }

  } catch (err) {
    errorCount++
    if (errorCount <= MAX_LOG_ERRORS) {
      console.error(`[Poll Error #${errorCount}] ${err.message}`)
    }
    if (errorCount === MAX_LOG_ERRORS) {
      console.warn('⚠️  Repeated poll errors — suppressing further logs')
      console.warn('   Check: BLYNK_AUTH_TOKEN, network connectivity, device online')
    }
    // Do NOT rethrow — the setInterval must keep running
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Start the Blynk polling loop.
 * If the token is missing/placeholder, logs a warning and returns without
 * crashing so the REST API remains accessible for testing.
 */
function startPolling() {
  if (!TOKEN || TOKEN === 'your_blynk_token_here') {
    console.error('❌ BLYNK_AUTH_TOKEN not set in .env')
    console.error('   Get your token: Blynk Console → Device → Device Info → Auth Token')
    console.warn('⚠️  Blynk polling is DISABLED — REST API still available')
    return
  }

  console.log(`🔄 Blynk poller starting...`)
  console.log(`   Endpoint : ${BASE_URL}/get?token=${TOKEN.substring(0, 8)}...&V10`)
  console.log(`   Interval : ${INTERVAL_MS}ms`)

  // Run immediately, then on interval
  runPollCycle()
  pollTimer = setInterval(runPollCycle, INTERVAL_MS)
}

/**
 * Stop the polling interval — called during graceful shutdown.
 */
function stopPolling() {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
    console.log('🛑 Blynk poller stopped')
  }
}

module.exports = { startPolling, stopPolling }
