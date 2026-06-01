'use strict'

const express   = require('express')
const SensorLog = require('../models/SensorLog')

const router = express.Router()

/**
 * GET /api/sensors/latest
 * Returns the most recent temperature reading.
 *
 * Response 200: { id, temp, timestamp }
 * Response 404: { error: 'No data yet' }
 * Response 500: { error: 'Database error', detail: string }
 */
router.get('/latest', async (_req, res) => {
  try {
    const row = await SensorLog.getLatest()
    if (!row) return res.status(404).json({ error: 'No data yet' })
    res.json(row)
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] [GET /latest]`, err.message)
    res.status(500).json({ error: 'Database error', detail: err.message })
  }
})

/**
 * GET /api/sensors/history
 * Returns temperature history ordered newest-first.
 *
 * Query params:
 *   limit  {number}  Max records (default 100, capped at 500)
 *   from   {string}  ISO 8601 start timestamp — inclusive (optional)
 *   to     {string}  ISO 8601 end timestamp   — inclusive (optional)
 *
 * Example: GET /api/sensors/history?limit=200&from=2026-05-09T00:00:00Z
 *
 * Response 200: Array<{ id, temp, timestamp }>
 * Response 400: { error: 'Invalid "from" date format' }
 * Response 500: { error: 'Database error', detail: string }
 */
router.get('/history', async (req, res) => {
  try {
    const { limit, from, to } = req.query

    if (from && isNaN(new Date(from).getTime())) {
      return res.status(400).json({ error: 'Invalid "from" date format' })
    }
    if (to && isNaN(new Date(to).getTime())) {
      return res.status(400).json({ error: 'Invalid "to" date format' })
    }

    const rows = await SensorLog.getHistory({ limit, from, to })
    res.json(rows)
  } catch (err) {
    console.error(`[${new Date().toLocaleTimeString()}] [GET /history]`, err.message)
    res.status(500).json({ error: 'Database error', detail: err.message })
  }
})

module.exports = router
