// The alarm meter: 0 when the museum is calm, 100 when the heist is blown.
// Guards raise it fast, cameras a little slower, and it cools down while the
// thief stays out of sight. At 100 the museum locks down and the thief is caught.

import { ALARM } from './config.js';

/** Fresh alarm state. */
export function createAlarm() {
  return { value: 0, rising: false };
}

/**
 * Advance the alarm one step. `seenByGuard` and `seenByCamera` say whether any
 * guard or camera has eyes on the thief right now. Returns 'blown' at 100.
 */
export function updateAlarm(alarm, dt, seenByGuard, seenByCamera) {
  let rate = 0;
  if (seenByGuard) rate += ALARM.guardRate;
  if (seenByCamera) rate += ALARM.cameraRate;
  if (rate > 0) {
    alarm.value = Math.min(ALARM.max, alarm.value + rate * dt);
    alarm.rising = true;
  } else {
    alarm.value = Math.max(0, alarm.value - ALARM.decayRate * dt);
    alarm.rising = false;
  }
  return alarm.value >= ALARM.max ? 'blown' : null;
}
