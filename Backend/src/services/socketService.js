'use strict'

/** @type {import('socket.io').Server|null} */
let _io = null

/**
 * Store the Socket.io server instance.
 * Must be called exactly once from index.js after `io` is created.
 *
 * @param {import('socket.io').Server} io
 */
function init(io) {
  _io = io
  console.log('✅ Socket.io service initialized')
}

/**
 * Broadcast an event to every connected client.
 * Logs a warning and no-ops if called before init().
 *
 * @param {string} event - Socket.io event name
 * @param {any}    data  - Payload (serialized as JSON by Socket.io)
 */
function emit(event, data) {
  if (!_io) {
    console.warn('[Socket] Warning: emit() called before init() — event dropped:', event)
    return
  }
  _io.emit(event, data)
}

/**
 * Return the current number of connected Socket.io clients.
 *
 * @returns {number}
 */
function getConnectedCount() {
  return _io ? _io.engine.clientsCount : 0
}

module.exports = { init, emit, getConnectedCount }
