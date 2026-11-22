// The guards: they walk their waypoints on patrol, chase when they spot the
// thief, search the last place they saw her, then walk back to their route.
// A guard's state is one of: patrol, chase, search, return.

import { GUARD } from './config.js';
import { canSee, circleHitsRects } from './world.js';

function moveToward(guard, targetX, targetY, speed, dt, solids) {
  const dx = targetX - guard.x;
  const dy = targetY - guard.y;
  const distance = Math.hypot(dx, dy);
  if (distance < 1) return true;
  const step = Math.min(speed * dt, distance);
  const nx = guard.x + (dx / distance) * step;
  const ny = guard.y + (dy / distance) * step;
  guard.angle = Math.atan2(dy, dx);
  if (!circleHitsRects(nx, ny, GUARD.radius, solids)) {
    guard.x = nx;
    guard.y = ny;
  }
  return distance <= step;
}

function setState(guard, state) {
  guard.state = state;
  guard.stateTime = 0;
}

/**
 * Advance one guard a step. Returns 'caught' when the guard grabs the thief.
 * `smoke` makes the thief invisible to every guard this step.
 */
export function updateGuard(guard, dt, state, smoke) {
  const solids = state.solids;
  const thief = state.thief;
  const seen = !smoke && canSee(
    guard.x, guard.y, guard.angle,
    GUARD.sightRange, GUARD.sightHalfAngle,
    thief.x, thief.y, solids,
  );
  guard.seen = seen;
  guard.stateTime += dt;

  if (seen) {
    guard.lastSeenX = thief.x;
    guard.lastSeenY = thief.y;
    if (guard.state !== 'chase') setState(guard, 'chase');
  }

  if (guard.state === 'chase') {
    const reached = moveToward(guard, thief.x, thief.y, GUARD.chaseSpeed, dt, solids);
    if (Math.hypot(thief.x - guard.x, thief.y - guard.y) <= GUARD.catchDistance) return 'caught';
    if (!seen && guard.stateTime > GUARD.loseSightTime) setState(guard, 'search');
    return null;
  }

  if (guard.state === 'search') {
    const arrived = moveToward(guard, guard.lastSeenX, guard.lastSeenY, GUARD.patrolSpeed * 1.4, dt, solids);
    if (arrived || guard.stateTime > GUARD.searchTime + 2) setState(guard, 'return');
    return null;
  }

  if (guard.state === 'return') {
    const home = guard.waypoints[guard.waypointIndex];
    const arrived = moveToward(guard, home.x, home.y, GUARD.patrolSpeed * 1.4, dt, solids);
    if (arrived) setState(guard, 'patrol');
    return null;
  }

  // patrol: walk the waypoints in order, looking where they walk.
  const target = guard.waypoints[guard.waypointIndex];
  const arrived = moveToward(guard, target.x, target.y, GUARD.patrolSpeed, dt, solids);
  if (arrived) guard.waypointIndex = (guard.waypointIndex + 1) % guard.waypoints.length;
  return null;
}
