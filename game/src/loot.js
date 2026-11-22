// The loot: gold coins scattered through the rooms and the Sari Diamond on its
// pedestal in the vault. Coins pay for tools; the diamond is what the heist is
// for, and carrying it out through the exit door wins the game.

import { DIAMOND_SPOT, EXIT_ZONE, PEDESTAL, pointInRect } from './world.js';
import { LOOT } from './config.js';

/** Fresh loot state: all coins out, the diamond waiting on its pedestal. */
export function createLoot(coins) {
  return {
    coins,
    diamond: { x: DIAMOND_SPOT.x, y: DIAMOND_SPOT.y, radius: 16, taken: false, value: LOOT.diamondValue },
    coinsCollected: 0,
  };
}

/**
 * Pick up whatever the thief touches. Returns a list of events:
 * 'coin', 'diamond', or 'exit' (thief reached the door while carrying the diamond).
 */
export function checkLoot(state) {
  const events = [];
  const thief = state.thief;
  for (const coin of state.loot.coins) {
    if (!coin.taken && Math.hypot(coin.x - thief.x, coin.y - thief.y) < thief.radius + coin.radius) {
      coin.taken = true;
      state.loot.coinsCollected += 1;
      state.coins += coin.value;
      events.push('coin');
    }
  }
  const diamond = state.loot.diamond;
  if (!diamond.taken && Math.hypot(diamond.x - thief.x, diamond.y - thief.y) < thief.radius + diamond.radius + 6) {
    diamond.taken = true;
    state.hasDiamond = true;
    state.coins += diamond.value;
    events.push('diamond');
  }
  if (state.hasDiamond && pointInRect(thief.x, thief.y, EXIT_ZONE)) events.push('exit');
  return events;
}

export { PEDESTAL };
