// The thief: Rani, the night burglar. WASD or arrow keys move her; a mouse click
// sets a spot to walk to. Walls and display cases stop her, and she cannot leave
// the museum floor.

import { FIELD, HUD_HEIGHT, THIEF } from './config.js';
import { circleHitsRects } from './world.js';

/** Fresh thief state at the gallery door. */
export function createThief() {
  return {
    x: THIEF.startX,
    y: THIEF.startY,
    radius: THIEF.radius,
    /** Where a mouse click told her to walk, or null. */
    targetX: null,
    targetY: null,
    moving: false,
  };
}

function tryMove(thief, dx, dy, solids) {
  const nextX = thief.x + dx;
  const nextY = thief.y + dy;
  if (nextX - thief.radius < 0 || nextX + thief.radius > FIELD.width) return false;
  if (nextY - thief.radius < HUD_HEIGHT || nextY + thief.radius > FIELD.height) return false;
  if (circleHitsRects(nextX, nextY, thief.radius, solids)) return false;
  thief.x = nextX;
  thief.y = nextY;
  return true;
}

/**
 * Move the thief one step. `direction` is {x, y} from the keys (-1..1 each);
 * a click target overrides the keys until it is reached or a key is pressed.
 */
export function updateThief(thief, dt, direction, solids) {
  const speed = THIEF.speed * dt;
  thief.moving = false;
  if (direction.x !== 0 || direction.y !== 0) {
    thief.targetX = null;
    thief.targetY = null;
    const length = Math.hypot(direction.x, direction.y);
    const nx = direction.x / length;
    const ny = direction.y / length;
    // Move on each axis separately so she slides along walls instead of sticking.
    if (!tryMove(thief, nx * speed, 0, solids)) tryMove(thief, 0, ny * speed, solids);
    else tryMove(thief, 0, ny * speed, solids);
    thief.moving = true;
    return;
  }
  if (thief.targetX !== null && thief.targetY !== null) {
    const dx = thief.targetX - thief.x;
    const dy = thief.targetY - thief.y;
    const distance = Math.hypot(dx, dy);
    if (distance < 6) {
      thief.targetX = null;
      thief.targetY = null;
      return;
    }
    const step = Math.min(speed, distance);
    const moved = tryMove(thief, (dx / distance) * step, 0, solids)
      || tryMove(thief, 0, (dy / distance) * step, solids);
    if (!moved) {
      thief.targetX = null;
      thief.targetY = null;
    }
    thief.moving = true;
  }
}
