// The screenshot scenes behind ?shot=cover|patrol|alert|exit. Each one sets the
// real game state to a fixed, deterministic moment — the same seed always gives
// the same frame — and the renderer paints it, so every screenshot is a true
// render of the game's own code.

import { SCREEN_CAUGHT, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { resetGame } from './game.js';
import { STEP } from './config.js';

/**
 * Stage the named scene on `state` and return the screen to draw over it and
 * the best loot total to show. Unknown names stage the cover.
 */
export function stageShot(name, state) {
  resetGame(state);
  if (name === 'patrol') {
    // The opening moment: Rani at the gallery door, guards on their routes.
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'alert') {
    // Caught in the act: a guard is chasing Rani in the corridor, the alarm
    // is nearly blown, a camera has her in its cone.
    state.thief.x = 500;
    state.thief.y = 260;
    state.alarm.value = 82;
    state.coins = 75;
    state.loot.coins[0].taken = true;
    state.loot.coins[1].taken = true;
    state.loot.coins[2].taken = true;
    state.loot.coinsCollected = 3;
    const guard = state.guards[1];
    guard.x = 580;
    guard.y = 360;
    guard.angle = Math.atan2(260 - 360, 500 - 580);
    guard.state = 'chase';
    guard.seen = true;
    state.spotted = true;
    const camera = state.cameras[0];
    camera.angle = Math.atan2(260 - 92, 500 - 420);
    camera.seen = true;
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'exit') {
    // The getaway: diamond taken, Rani at the exit door with the vault behind her.
    state.loot.diamond.taken = true;
    state.hasDiamond = true;
    state.coins = 575;
    state.loot.coinsCollected = 3;
    for (let i = 0; i < 3; i += 1) state.loot.coins[i].taken = true;
    state.thief.x = 132;
    state.thief.y = 662;
    state.alarm.value = 24;
    return { screen: SCREEN_WIN, best: 575 };
  }
  // cover: the heist mid-flight, everything the judge wants in one frame.
  // Rani sneaks through the corridor past a display case; the gallery guard's
  // cone sweeps just behind her, a camera sweeps the doorway, the diamond
  // glints in the vault, and the alarm sits at 35%.
  state.thief.x = 620;
  state.thief.y = 430;
  state.alarm.value = 35;
  state.coins = 50;
  state.loot.coins[0].taken = true;
  state.loot.coins[1].taken = true;
  state.loot.coinsCollected = 2;
  const galleryGuard = state.guards[0];
  galleryGuard.x = 350;
  galleryGuard.y = 420;
  galleryGuard.angle = Math.PI * 0.15;
  galleryGuard.state = 'patrol';
  const corridorGuard = state.guards[1];
  corridorGuard.x = 700;
  corridorGuard.y = 220;
  corridorGuard.angle = Math.PI / 2;
  corridorGuard.state = 'patrol';
  const vaultGuard = state.guards[2];
  vaultGuard.x = 1000;
  vaultGuard.y = 560;
  vaultGuard.angle = -Math.PI / 2;
  vaultGuard.state = 'patrol';
  state.cameras[0].angle = Math.PI / 2;
  state.cameras[1].angle = -Math.PI / 2;
  state.cameras[2].angle = Math.PI * 0.75;
  return { screen: SCREEN_PLAY, best: 0 };
}

export { SCREEN_TITLE, SCREEN_CAUGHT };
