'use strict'
require('dotenv').config()

const { Pool } = require('pg')

// ── Validate required env var ─────────────────────────────────────────────────
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set in .env file')
  console.error('   Example: postgresql://postgres:password@localhost:5432/oven_dashboard')
  process.exit(1)
}

/**
 * Shared connection pool — import { pool } wherever a query is needed.
 * Never instantiate a second Pool in another module.
 */
const pool = new Pool({
  connectionString:        process.env.DATABASE_URL,
  max:                     10,
  idleTimeoutMillis:       30000,
  connectionTimeoutMillis: 5000,   // 5s — allows for slow local PG startup
})

// Log pool-level errors without crashing (prevents unhandled rejection)
pool.on('error', (err) => {
  console.error('❌ PostgreSQL pool error:', err.message)
})

/**
 * Test the connection and create the sensor_logs table + index if they don't
 * exist. Called once at startup; re-throws on failure so index.js can exit.
 *
 * @returns {Promise<void>}
 */
async function initDB() {
  let client
  try {
    // Grab a client to test connectivity
    client = await pool.connect()
    console.log('✅ PostgreSQL connection successful')

    // Create sensor_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS sensor_logs (
        id        SERIAL       PRIMARY KEY,
        temp      NUMERIC(5,2) NOT NULL,
        timestamp TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `)

    // Index for fast ORDER BY timestamp DESC queries
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_sensor_logs_timestamp
        ON sensor_logs(timestamp DESC)
    `)

    console.log('✅ Tables and indexes ready')

  } catch (err) {
    // Map common PostgreSQL error codes to human-readable messages
    if (err.code === 'ECONNREFUSED') {
      console.error('❌ Cannot connect to PostgreSQL — is it running?')
      console.error('   Check: pg service must be running on localhost:5432')
      console.error('   Windows: Open Services → find "postgresql-x64-*" → Start')
    } else if (err.code === '3D000') {
      console.error('❌ Database does not exist')
      console.error('   Run in terminal:  createdb oven_dashboard')
      console.error('   Or in psql:       CREATE DATABASE oven_dashboard;')
    } else if (err.code === '28P01') {
      console.error('❌ PostgreSQL authentication failed — wrong password in DATABASE_URL')
    } else if (err.code === '28000') {
      console.error('❌ PostgreSQL role not found — wrong username in DATABASE_URL')
    } else if (err.code === 'ENOTFOUND') {
      console.error('❌ PostgreSQL host not found — check the hostname in DATABASE_URL')
    } else {
      console.error('❌ Database init error:', err.message)
      console.error('   Code:', err.code || 'n/a')
    }
    throw err   // re-throw so start() in index.js catches and exits
  } finally {
    if (client) client.release()
  }
}

module.exports = { pool, initDB }
