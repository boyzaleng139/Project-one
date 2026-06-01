'use strict'

const { pool } = require('../config/db')

/**
 * Insert one temperature reading into sensor_logs.
 * The timestamp column defaults to NOW() in the database.
 *
 * @param {number} temp - Temperature in °C (up to 2 decimal places)
 * @returns {Promise<{ id: number, temp: string, timestamp: Date }>}
 */
async function insert(temp) {
  const result = await pool.query(
    'INSERT INTO sensor_logs (temp) VALUES ($1) RETURNING *',
    [temp]
  )
  return result.rows[0]
}

/**
 * Get the single most recent temperature reading.
 *
 * @returns {Promise<{ id: number, temp: string, timestamp: Date }|null>}
 */
async function getLatest() {
  const result = await pool.query(
    'SELECT * FROM sensor_logs ORDER BY timestamp DESC LIMIT 1'
  )
  return result.rows[0] || null
}

/**
 * Get temperature history with optional time-range filtering.
 * Results are ordered newest-first (DESC).
 *
 * @param {Object} [opts]
 * @param {number|string} [opts.limit=100] - Max records (capped at 500)
 * @param {string} [opts.from]             - ISO 8601 lower bound (inclusive)
 * @param {string} [opts.to]               - ISO 8601 upper bound (inclusive)
 * @returns {Promise<Array<{ id: number, temp: string, timestamp: Date }>>}
 */
async function getHistory({ limit = 100, from, to } = {}) {
  const cap        = Math.min(Math.max(parseInt(limit) || 100, 1), 500)
  const values     = []
  const conditions = []

  if (from) {
    values.push(new Date(from))
    conditions.push(`timestamp >= $${values.length}`)
  }
  if (to) {
    values.push(new Date(to))
    conditions.push(`timestamp <= $${values.length}`)
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

  values.push(cap)

  const result = await pool.query(
    `SELECT * FROM sensor_logs ${where} ORDER BY timestamp DESC LIMIT $${values.length}`,
    values
  )
  return result.rows
}

module.exports = { insert, getLatest, getHistory }
