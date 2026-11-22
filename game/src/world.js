// The museum itself: three rooms, the walls and display cases between them, the
// loot, the exit, and the geometry helpers every other module uses (movement
// collision, line of sight, and vision cones).

import { FIELD, HUD_HEIGHT, LOOT } from './config.js';

export const ROOM_GALLERY = 0;
export const ROOM_CORRIDOR = 1;
export const ROOM_VAULT = 2;

export const ROOM_NAMES = ['Galeri Lukisan', 'Koridor Tengah', 'Ruang Brankas'];

/** Vertical walls at x=420 and x=860, each with a doorway gap in the middle. */
export function buildWalls() {
  const walls = [];
  const top = HUD_HEIGHT;
  const bottom = FIELD.height;
  for (const x of [420, 860]) {
    walls.push({ x: x - 8, y: top, width: 16, height: 330 - top });
    walls.push({ x: x - 8, y: 430, width: 16, height: bottom - 430 });
  }
  return walls;
}

/** Display cases: solid glass boxes that block movement and block sight. */
export function buildCases() {
  return [
    { x: 120, y: 180, width: 150, height: 64 },
    { x: 120, y: 500, width: 150, height: 64 },
    { x: 540, y: 140, width: 130, height: 54 },
    { x: 560, y: 560, width: 130, height: 54 },
    { x: 990, y: 170, width: 170, height: 60 },
    { x: 990, y: 510, width: 170, height: 60 },
  ];
}

/** The diamond's pedestal in the vault room (solid, blocks movement). */
export const PEDESTAL = { x: 1118, y: 356, width: 64, height: 56 };

/** The getaway door, bottom-left of the gallery. */
export const EXIT_ZONE = { x: 16, y: 648, width: 128, height: 56 };

/** The loot target: the Sari Diamond, on its pedestal in the vault. */
export const DIAMOND_SPOT = { x: 1150, y: 384 };

export function buildCoins(random) {
  const spots = [
    { x: 200, y: 300 },
    { x: 320, y: 620 },
    { x: 620, y: 300 },
    { x: 760, y: 620 },
    { x: 960, y: 300 },
    { x: 1060, y: 640 },
  ];
  return spots.map((spot, index) => ({
    id: index,
    x: spot.x + (random() - 0.5) * 24,
    y: spot.y + (random() - 0.5) * 24,
    radius: 11,
    value: LOOT.coinValue,
    taken: false,
  }));
}

export function buildGuards() {
  return [
    {
      id: 0, name: 'Satpam Galeri', x: 200, y: 300, angle: 0,
      waypoints: [{ x: 200, y: 300 }, { x: 200, y: 600 }, { x: 350, y: 450 }],
      waypointIndex: 0, state: 'patrol', stateTime: 0, lastSeenX: 0, lastSeenY: 0,
      seen: false, speed: 0,
    },
    {
      id: 1, name: 'Satpam Koridor', x: 500, y: 200, angle: Math.PI / 2,
      waypoints: [{ x: 500, y: 200 }, { x: 720, y: 500 }, { x: 500, y: 520 }],
      waypointIndex: 0, state: 'patrol', stateTime: 0, lastSeenX: 0, lastSeenY: 0,
      seen: false, speed: 0,
    },
    {
      id: 2, name: 'Satpam Brankas', x: 950, y: 300, angle: 0,
      waypoints: [{ x: 950, y: 300 }, { x: 1180, y: 560 }, { x: 950, y: 560 }],
      waypointIndex: 0, state: 'patrol', stateTime: 0, lastSeenX: 0, lastSeenY: 0,
      seen: false, speed: 0,
    },
  ];
}

export function buildCameras() {
  return [
    { id: 0, x: 420, y: 92, baseAngle: Math.PI / 2, angle: Math.PI / 2, phase: 0, seen: false, jammed: false },
    { id: 1, x: 860, y: 700, baseAngle: -Math.PI / 2, angle: -Math.PI / 2, phase: 2.1, seen: false, jammed: false },
    { id: 2, x: 1256, y: 92, baseAngle: Math.PI * 0.75, angle: Math.PI * 0.75, phase: 4.2, seen: false, jammed: false },
  ];
}

// ---- geometry helpers -------------------------------------------------------

export function pointInRect(x, y, rect) {
  return x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;
}

/** True when a circle of `radius` at (x, y) touches any rect in `rects`. */
export function circleHitsRects(x, y, radius, rects) {
  for (const rect of rects) {
    const closestX = Math.max(rect.x, Math.min(x, rect.x + rect.width));
    const closestY = Math.max(rect.y, Math.min(y, rect.y + rect.height));
    const dx = x - closestX;
    const dy = y - closestY;
    if (dx * dx + dy * dy < radius * radius) return true;
  }
  return false;
}

function segmentHitsRect(x1, y1, x2, y2, rect) {
  // Quick reject: both ends on the same outside side.
  if ((x1 < rect.x && x2 < rect.x) || (x1 > rect.x + rect.width && x2 > rect.x + rect.width)
    || (y1 < rect.y && y2 < rect.y) || (y1 > rect.y + rect.height && y2 > rect.y + rect.height)) return false;
  if (pointInRect(x1, y1, rect) || pointInRect(x2, y2, rect)) return true;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const edges = [
    [rect.x, rect.y, rect.x + rect.width, rect.y],
    [rect.x + rect.width, rect.y, rect.x + rect.width, rect.y + rect.height],
    [rect.x + rect.width, rect.y + rect.height, rect.x, rect.y + rect.height],
    [rect.x, rect.y + rect.height, rect.x, rect.y],
  ];
  for (const [ax, ay, bx, by] of edges) {
    const denominator = (bx - ax) * dy - (by - ay) * dx;
    if (denominator === 0) continue;
    const t = ((ax - x1) * dy - (ay - y1) * dx) / denominator;
    const u = ((ax - x1) * (by - ay) - (ay - y1) * (bx - ax)) / denominator;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) return true;
  }
  return false;
}

/** True when a straight line between two points is blocked by any solid rect. */
export function lineBlocked(x1, y1, x2, y2, solids) {
  for (const rect of solids) {
    if (segmentHitsRect(x1, y1, x2, y2, rect)) return true;
  }
  return false;
}

/**
 * True when a target point sits inside a vision cone (origin, facing angle,
 * range, half-angle) and the line of sight is not blocked by solid rects.
 */
export function canSee(originX, originY, facing, range, halfAngle, targetX, targetY, solids) {
  const dx = targetX - originX;
  const dy = targetY - originY;
  const distance = Math.hypot(dx, dy);
  if (distance > range) return false;
  if (distance < 1) return true;
  let diff = Math.atan2(dy, dx) - facing;
  while (diff > Math.PI) diff -= 2 * Math.PI;
  while (diff < -Math.PI) diff += 2 * Math.PI;
  if (Math.abs(diff) > halfAngle) return false;
  return !lineBlocked(originX, originY, targetX, targetY, solids);
}

/** All solid rects in the museum: walls, cases and the pedestal. */
export function allSolids(state) {
  return [...state.walls, ...state.cases, PEDESTAL];
}
