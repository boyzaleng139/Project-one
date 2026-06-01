'use strict';

const BASE_URL = process.env.BLYNK_BASE_URL;
const TOKEN    = process.env.BLYNK_AUTH_TOKEN;

/**
 * Sends a single PUT request to the Blynk external API.
 * @param {Record<string, string|number>} pins  - e.g. { v0: 1 }
 * @returns {Promise<boolean>} true on HTTP 2xx, false on any error.
 */
async function blynkPut(pins) {
  const params = new URLSearchParams({ token: TOKEN, ...pins });
  const url = `${BASE_URL}/update?${params.toString()}`;
  try {
    const res = await fetch(url, { method: 'GET' }); // Blynk uses GET for /update
    if (!res.ok) {
      console.error(`[blynkControl] PUT failed: ${res.status} ${res.statusText}`);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[blynkControl] Network error:', err.message);
    return false;
  }
}

/**
 * Turns the dryer on (value=1) or off (value=0) via Blynk V0.
 * @param {0|1} value
 * @returns {Promise<boolean>}
 */
async function setPower(value) {
  return blynkPut({ v0: value });
}

/**
 * Sets fan speeds for rear (V11) and side (V12) fans.
 * @param {number} rear  - 0–255
 * @param {number} side  - 0–255
 * @returns {Promise<boolean>}
 */
async function setFan(rear, side) {
  return blynkPut({ v11: rear, v12: side });
}

/**
 * Turns the drying chamber lights on (value=1) or off (value=0) via Blynk V13.
 * @param {0|1} value
 * @returns {Promise<boolean>}
 */
async function setLights(value) {
  return blynkPut({ v13: value });
}

module.exports = { setPower, setFan, setLights };
