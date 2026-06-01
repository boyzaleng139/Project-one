'use strict';

const { Router } = require('express');
const { setPower, setFan, setLights } = require('../services/blynkControl');

const router = Router();

/**
 * POST /api/control/power
 * Body: { value: 0 | 1 }
 * Turns the dryer on or off via Blynk V0.
 */
router.post('/power', async (req, res) => {
  const { value } = req.body;
  if (value !== 0 && value !== 1) {
    return res.status(400).json({ error: "'value' must be 0 or 1" });
  }
  try {
    const ok = await setPower(value);
    ok
      ? res.json({ success: true, message: `Power set to ${value}` })
      : res.status(502).json({ error: 'Blynk request failed' });
  } catch (err) {
    console.error('[controlRoutes] /power:', err.message);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * POST /api/control/fan
 * Body: { fanRear: 0–255, fanSide: 0–255 }
 * Sets rear (V11) and side (V12) fan speeds.
 */
router.post('/fan', async (req, res) => {
  const { fanRear, fanSide } = req.body;
  if (
    typeof fanRear !== 'number' || fanRear < 0 || fanRear > 255 ||
    typeof fanSide !== 'number' || fanSide < 0 || fanSide > 255
  ) {
    return res.status(400).json({ error: "'fanRear' and 'fanSide' must be numbers 0–255" });
  }
  try {
    const ok = await setFan(fanRear, fanSide);
    ok
      ? res.json({ success: true, fanRear, fanSide })
      : res.status(502).json({ error: 'Blynk request failed' });
  } catch (err) {
    console.error('[controlRoutes] /fan:', err.message);
    res.status(500).json({ error: 'Internal error' });
  }
});

/**
 * POST /api/control/lights
 * Body: { value: 0 | 1 }
 * Turns chamber lights on or off via Blynk V13.
 */
router.post('/lights', async (req, res) => {
  const { value } = req.body;
  if (value !== 0 && value !== 1) {
    return res.status(400).json({ error: "'value' must be 0 or 1" });
  }
  try {
    const ok = await setLights(value);
    ok
      ? res.json({ success: true, message: `Lights set to ${value}` })
      : res.status(502).json({ error: 'Blynk request failed' });
  } catch (err) {
    console.error('[controlRoutes] /lights:', err.message);
    res.status(500).json({ error: 'Internal error' });
  }
});

module.exports = router;
