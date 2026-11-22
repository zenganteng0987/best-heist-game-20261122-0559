// The game state: one object holding the thief, the guards, the cameras, the
// loot and the alarm, and the one step function that advances them all.
// main.js owns the screens; this module owns only the rules of the heist.

import { createRandom } from './random.js';
import { ALARM, TOOLS } from './config.js';
import {
  buildCameras, buildCases, buildCoins, buildGuards, buildWalls, allSolids,
} from './world.js';
import { createThief, updateThief } from './thief.js';
import { updateGuard } from './guard.js';
import { updateCamera } from './camera.js';
import { createLoot, checkLoot } from './loot.js';
import { createAlarm, updateAlarm } from './alarm.js';

export const EVENT_NONE = 0;
export const EVENT_COIN = 1;
export const EVENT_DIAMOND = 2;
export const EVENT_WIN = 4;
export const EVENT_CAUGHT = 8;
export const EVENT_SPOTTED = 16;
export const EVENT_TOOL = 32;
export const EVENT_DENIED = 64;

/** Build a fresh heist from a seed. */
export function createGame(seed) {
  const random = createRandom(seed);
  const state = {
    seed,
    time: 0,
    thief: createThief(),
    walls: buildWalls(),
    cases: buildCases(),
    guards: buildGuards(),
    cameras: buildCameras(),
    loot: null,
    alarm: createAlarm(),
    coins: 0,
    hasDiamond: false,
    smokeTime: 0,
    jammerTime: 0,
    /** True while any guard or camera has eyes on the thief. */
    spotted: false,
    /** True the first frame a guard or camera newly spots the thief. */
    newlySpotted: false,
  };
  state.loot = createLoot(buildCoins(random));
  state.solids = allSolids(state);
  return state;
}

/** Reset the same state object to a fresh heist with the same seed. */
export function resetGame(state) {
  const fresh = createGame(state.seed);
  for (const key of Object.keys(fresh)) state[key] = fresh[key];
}

function useTool(state, tool) {
  if (state.coins < tool.cost) return EVENT_DENIED;
  state.coins -= tool.cost;
  if (tool === TOOLS.smoke) state.smokeTime = tool.duration;
  else state.jammerTime = tool.duration;
  return EVENT_TOOL;
}

/**
 * Advance the heist one fixed step. `direction` is the keys' {x, y},
 * `clickTarget` a mouse destination or null, `tool` is 'smoke' | 'jammer' | null.
 * Returns a bitmask of EVENT_* flags.
 */
export function stepGame(state, dt, direction, clickTarget, tool) {
  let events = EVENT_NONE;
  state.time += dt;
  if (state.smokeTime > 0) state.smokeTime -= dt;
  if (state.jammerTime > 0) state.jammerTime -= dt;
  if (tool === 'smoke') events |= useTool(state, TOOLS.smoke);
  if (tool === 'jammer') events |= useTool(state, TOOLS.jammer);

  if (clickTarget) {
    state.thief.targetX = clickTarget.x;
    state.thief.targetY = clickTarget.y;
  }
  updateThief(state.thief, dt, direction, state.solids);

  const smoke = state.smokeTime > 0;
  const jammed = state.jammerTime > 0;
  let seenByGuard = false;
  let seenByCamera = false;
  for (const guard of state.guards) {
    if (updateGuard(guard, dt, state, smoke) === 'caught') events |= EVENT_CAUGHT;
    if (guard.seen) seenByGuard = true;
  }
  for (const camera of state.cameras) {
    updateCamera(camera, dt, state, jammed);
    if (camera.seen) seenByCamera = true;
  }

  const wasSpotted = state.spotted;
  state.spotted = seenByGuard || seenByCamera;
  state.newlySpotted = state.spotted && !wasSpotted;
  if (state.newlySpotted) events |= EVENT_SPOTTED;

  if (updateAlarm(state.alarm, dt, seenByGuard, seenByCamera) === 'blown') events |= EVENT_CAUGHT;

  for (const found of checkLoot(state)) {
    if (found === 'coin') events |= EVENT_COIN;
    if (found === 'diamond') events |= EVENT_DIAMOND;
    if (found === 'exit') events |= EVENT_WIN;
  }
  return events;
}

export { ALARM };
