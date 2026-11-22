// The CCTV cameras: fixed to the walls, sweeping their cone back and forth.
// A jammer freezes them blind for a while; otherwise a thief crossing their
// cone raises the alarm.

import { CAMERA } from './config.js';
import { canSee } from './world.js';

/** Advance a camera's sweep one step and check whether it sees the thief. */
export function updateCamera(camera, dt, state, jammed) {
  camera.jammed = jammed;
  if (jammed) {
    camera.seen = false;
    return;
  }
  camera.phase += (dt * 2 * Math.PI) / CAMERA.sweepPeriod;
  camera.angle = camera.baseAngle + Math.sin(camera.phase) * CAMERA.sweepArc;
  camera.seen = canSee(
    camera.x, camera.y, camera.angle,
    CAMERA.sightRange, CAMERA.sightHalfAngle,
    state.thief.x, state.thief.y, state.solids,
  );
}
