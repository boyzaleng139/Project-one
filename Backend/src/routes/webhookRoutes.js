'use strict';

const { Router } = require('express');
const { insertSensorLog } = require('../models/SensorLog');
const { emit }            = require('../services/socketService');

const router = Router();

/**
 * POST /blynk/webhook
 * Accepts a Blynk webhook payload (JSON array or object), parses the sensor
 * fields, persists a new sensor_logs row, and broadcasts via Socket.io.
 *
 * Blynk sends either:
 *   Array form : [pinId, value, ...]  (legacy)
 *   Object form: { "pin": "V1", "value": "23.5" }  (modern)
 *
 * Because a single Blynk webhook fires per pin, we gracefully default
 * missing fields and let the poller handle the full multi-pin snapshot.
 */
router.post('/', async (req, res) => {
  try {
    const body = req.body;

    let temp    = 0;
    let phase   = 'IDLE';
    let status  = 0;
    let fanRear = 0;
    let fanSide = 0;

    // Modern object form: { pin, value }
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      const pin   = String(body.pin  ?? '').toLowerCase();
      const value = body.value ?? body.data ?? '';

      switch (pin) {
        case 'v1':  temp    = parseFloat(value) || 0; break;
        case 'v9':  status  = parseInt(value, 10)  || 0; break;
        case 'v10': phase   = String(value).toUpperCase(); break;
        case 'v11': fanRear = parseInt(value, 10)  || 0; break;
        case 'v12': fanSide = parseInt(value, 10)  || 0; break;
        default:
          // Unknown pin — acknowledge but do nothing
          return res.status(200).json({ received: true, skipped: true });
      }
    }

    // Array form: [pin, value, timestamp?, ...] (Blynk legacy)
    if (Array.isArray(body) && body.length >= 2) {
      const pin   = String(body[0]).toLowerCase();
      const value = body[1];
      switch (pin) {
        case 'v1':  temp    = parseFloat(value) || 0; break;
        case 'v9':  status  = parseInt(value, 10)  || 0; break;
        case 'v10': phase   = String(value).toUpperCase(); break;
        case 'v11': fanRear = parseInt(value, 10)  || 0; break;
        case 'v12': fanSide = parseInt(value, 10)  || 0; break;
        default:
          return res.status(200).json({ received: true, skipped: true });
      }
    }

    const row = await insertSensorLog({ temp, phase, status, fanRear, fanSide });
    emit('sensor_update', row);

    res.status(201).json({ received: true, id: row.id });
  } catch (err) {
    console.error('[webhookRoutes] Error:', err.message);
    res.status(500).json({ error: 'Failed to process webhook' });
  }
});

module.exports = router;
