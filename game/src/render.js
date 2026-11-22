// The renderer: everything the player sees, painted on one canvas.
// The museum floor is drawn room by room (gallery, corridor, vault), then the
// vision cones, the cameras, the loot, the guards and the thief, then the HUD
// with the alarm meter, coins, tools and objective. Title, pause, win and
// caught screens are painted over the same floor.

import {
  ALARM, CAMERA, FIELD, FONT, GUARD, HUD_HEIGHT, PALETTE, TOOLS,
} from './config.js';
import {
  DIAMOND_SPOT, EXIT_ZONE, PEDESTAL, ROOM_NAMES, pointInRect,
} from './world.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_WIN = 'win';
export const SCREEN_CAUGHT = 'caught';

const ROOM_FLOORS = [PALETTE.floorGallery, PALETTE.floorCorridor, PALETTE.floorVault];
const ROOM_BOUNDS = [
  { x: 0, width: 420 },
  { x: 420, width: 440 },
  { x: 860, width: 420 },
];

/** Make a renderer bound to a canvas. */
export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');

  function fitCanvas() {
    const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
    canvas.width = Math.round(FIELD.width * scale * window.devicePixelRatio);
    canvas.height = Math.round(FIELD.height * scale * window.devicePixelRatio);
    canvas.style.width = `${Math.round(FIELD.width * scale)}px`;
    canvas.style.height = `${Math.round(FIELD.height * scale)}px`;
    ctx.setTransform(canvas.width / FIELD.width, 0, 0, canvas.height / FIELD.height, 0, 0);
  }
  fitCanvas();
  window.addEventListener('resize', fitCanvas);

  function drawCone(x, y, angle, range, halfAngle, fill) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }

  function drawRoomFloors() {
    for (let i = 0; i < 3; i += 1) {
      ctx.fillStyle = ROOM_FLOORS[i];
      ctx.fillRect(ROOM_BOUNDS[i].x, HUD_HEIGHT, ROOM_BOUNDS[i].width, FIELD.height - HUD_HEIGHT);
    }
    // Carpet runners down each room, so the rooms read at a glance.
    ctx.fillStyle = PALETTE.carpet;
    ctx.fillRect(40, 240, 340, 240);
    ctx.fillRect(480, 240, 320, 240);
    ctx.fillRect(900, 240, 340, 240);
    // Room name plates on the floor.
    ctx.fillStyle = PALETTE.muted;
    ctx.font = '600 15px ' + FONT;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    for (let i = 0; i < 3; i += 1) {
      ctx.fillText(ROOM_NAMES[i].toUpperCase(), ROOM_BOUNDS[i].x + 16, HUD_HEIGHT + 28);
    }
  }

  function drawWallsAndCases(state) {
    ctx.fillStyle = PALETTE.wall;
    ctx.strokeStyle = PALETTE.wallEdge;
    ctx.lineWidth = 2;
    for (const wall of state.walls) {
      ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
      ctx.strokeRect(wall.x, wall.y, wall.width, wall.height);
    }
    for (const box of state.cases) {
      ctx.fillStyle = PALETTE.caseBase;
      ctx.fillRect(box.x, box.y + box.height - 10, box.width, 10);
      ctx.fillStyle = PALETTE.caseGlass;
      ctx.globalAlpha = 0.55;
      ctx.fillRect(box.x, box.y, box.width, box.height - 8);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)';
      ctx.strokeRect(box.x, box.y, box.width, box.height - 8);
      // A painting or vase inside each case.
      ctx.fillStyle = '#d8a24a';
      ctx.fillRect(box.x + box.width / 2 - 14, box.y + 10, 28, 26);
    }
    // The pedestal and its velvet rope.
    ctx.fillStyle = PALETTE.pedestal;
    ctx.fillRect(PEDESTAL.x, PEDESTAL.y, PEDESTAL.width, PEDESTAL.height);
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(PEDESTAL.x - 18, PEDESTAL.y + 10);
    ctx.quadraticCurveTo(PEDESTAL.x + PEDESTAL.width / 2, PEDESTAL.y + 34, PEDESTAL.x + PEDESTAL.width + 18, PEDESTAL.y + 10);
    ctx.stroke();
  }

  function drawExit(state) {
    const zone = EXIT_ZONE;
    ctx.fillStyle = state.hasDiamond ? PALETTE.exit : 'rgba(88,201,107,0.35)';
    ctx.fillRect(zone.x, zone.y, zone.width, zone.height);
    ctx.strokeStyle = PALETTE.exit;
    ctx.lineWidth = 2;
    ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);
    ctx.fillStyle = '#0d0f14';
    ctx.font = '700 15px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText('KELUAR', zone.x + zone.width / 2, zone.y + 24);
    ctx.font = '600 10px ' + FONT;
    ctx.fillText(state.hasDiamond ? 'bawa berlian ke sini' : 'butuh berlian dulu', zone.x + zone.width / 2, zone.y + 42);
  }

  function drawLoot(state) {
    for (const coin of state.loot.coins) {
      if (coin.taken) continue;
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.coin;
      ctx.fill();
      ctx.strokeStyle = '#8a6d1f';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = '#8a6d1f';
      ctx.font = '700 13px ' + FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Rp', coin.x, coin.y + 1);
      ctx.textBaseline = 'alphabetic';
    }
    const diamond = state.loot.diamond;
    if (!diamond.taken) {
      const pulse = 1 + 0.12 * Math.sin(state.time * 4);
      ctx.save();
      ctx.translate(DIAMOND_SPOT.x, DIAMOND_SPOT.y - 34);
      ctx.scale(pulse, pulse);
      ctx.beginPath();
      ctx.moveTo(0, -16);
      ctx.lineTo(13, 0);
      ctx.lineTo(0, 16);
      ctx.lineTo(-13, 0);
      ctx.closePath();
      ctx.fillStyle = PALETTE.diamond;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      ctx.fillStyle = PALETTE.diamond;
      ctx.font = '700 13px ' + FONT;
      ctx.textAlign = 'center';
      ctx.fillText('BERLIAN SARI', DIAMOND_SPOT.x, DIAMOND_SPOT.y + 58);
    }
  }

  function drawCameras(state) {
    for (const camera of state.cameras) {
      if (!camera.jammed) {
        drawCone(camera.x, camera.y, camera.angle, CAMERA.sightRange, CAMERA.sightHalfAngle,
          camera.seen ? PALETTE.coneSeen : PALETTE.coneCamera);
      }
      ctx.beginPath();
      ctx.arc(camera.x, camera.y, 11, 0, Math.PI * 2);
      ctx.fillStyle = camera.jammed ? '#555' : PALETTE.camera;
      ctx.fill();
      ctx.strokeStyle = '#222';
      ctx.lineWidth = 2;
      ctx.stroke();
      // The lens points where the camera looks.
      ctx.beginPath();
      ctx.moveTo(camera.x + Math.cos(camera.angle) * 8, camera.y + Math.sin(camera.angle) * 8);
      ctx.lineTo(camera.x + Math.cos(camera.angle) * 18, camera.y + Math.sin(camera.angle) * 18);
      ctx.strokeStyle = camera.jammed ? '#777' : '#d33';
      ctx.lineWidth = 3;
      ctx.stroke();
      if (camera.jammed) {
        ctx.fillStyle = '#fff';
        ctx.font = '700 10px ' + FONT;
        ctx.textAlign = 'center';
        ctx.fillText('JAM', camera.x, camera.y - 16);
      }
    }
  }

  function drawGuards(state) {
    for (const guard of state.guards) {
      drawCone(guard.x, guard.y, guard.angle, GUARD.sightRange, GUARD.sightHalfAngle,
        guard.seen || guard.state === 'chase' ? PALETTE.coneSeen : PALETTE.coneGuard);
      // Waypoint dots, so patrol routes are readable.
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      for (const point of guard.waypoints) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(guard.x, guard.y, GUARD.radius, 0, Math.PI * 2);
      ctx.fillStyle = PALETTE.guard;
      ctx.fill();
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();
      // Cap brim shows the facing direction.
      ctx.beginPath();
      ctx.moveTo(guard.x + Math.cos(guard.angle) * 8, guard.y + Math.sin(guard.angle) * 8);
      ctx.lineTo(guard.x + Math.cos(guard.angle) * 18, guard.y + Math.sin(guard.angle) * 18);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.fillStyle = '#fff';
      ctx.font = '700 10px ' + FONT;
      ctx.textAlign = 'center';
      const label = guard.state === 'chase' ? '!' : guard.state === 'search' ? '?' : '';
      if (label) ctx.fillText(label, guard.x, guard.y - GUARD.radius - 6);
    }
  }

  function drawThief(state) {
    const thief = state.thief;
    if (state.smokeTime > 0) {
      ctx.beginPath();
      ctx.arc(thief.x, thief.y, 34, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(200,200,210,0.35)';
      ctx.fill();
    }
    // Click destination marker.
    if (thief.targetX !== null) {
      ctx.beginPath();
      ctx.arc(thief.targetX, thief.targetY, 6, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.6)';
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, thief.radius, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.thiefCoat;
    ctx.fill();
    ctx.strokeStyle = PALETTE.thief;
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(thief.x, thief.y, 5, 0, Math.PI * 2);
    ctx.fillStyle = PALETTE.thief;
    ctx.fill();
    // No name label while she stands in the exit door: it would cover KELUAR.
    if (!pointInRect(thief.x, thief.y, EXIT_ZONE)) {
      ctx.fillStyle = '#fff';
      ctx.font = '700 11px ' + FONT;
      ctx.textAlign = 'center';
      ctx.fillText('RANI', thief.x, thief.y - thief.radius - 7);
    }
  }

  function drawHud(state, screen) {
    ctx.fillStyle = PALETTE.panel;
    ctx.fillRect(0, 0, FIELD.width, HUD_HEIGHT);
    ctx.fillStyle = PALETTE.panelEdge;
    ctx.fillRect(0, HUD_HEIGHT - 2, FIELD.width, 2);

    // Title.
    ctx.fillStyle = PALETTE.text;
    ctx.font = '700 20px ' + FONT;
    ctx.textAlign = 'left';
    ctx.fillText('MALAM DI MUSEUM SARI', 16, 28);
    ctx.fillStyle = PALETTE.muted;
    ctx.font = '600 12px ' + FONT;
    ctx.fillText('curi Berlian Sari, kabur lewat pintu keluar', 16, 48);

    // Alarm meter.
    const meterX = 470;
    const meterY = 16;
    const meterW = 300;
    const meterH = 20;
    ctx.fillStyle = PALETTE.muted;
    ctx.font = '700 12px ' + FONT;
    ctx.fillText('ALARM', meterX, meterY - 4);
    ctx.fillStyle = '#000';
    ctx.fillRect(meterX, meterY, meterW, meterH);
    const alarmFraction = state.alarm.value / ALARM.max;
    ctx.fillStyle = alarmFraction > 0.7 ? PALETTE.danger : alarmFraction > 0.35 ? '#f2c94c' : PALETTE.safe;
    ctx.fillRect(meterX, meterY, meterW * alarmFraction, meterH);
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1;
    ctx.strokeRect(meterX, meterY, meterW, meterH);
    ctx.fillStyle = PALETTE.text;
    ctx.font = '700 13px ' + FONT;
    ctx.fillText(`${Math.round(state.alarm.value)}%`, meterX + meterW + 10, meterY + 16);
    ctx.fillStyle = state.spotted ? PALETTE.danger : PALETTE.muted;
    ctx.font = '700 12px ' + FONT;
    ctx.fillText(state.spotted ? 'TERLIHAT!' : 'belum terlihat', meterX, meterY + 36);

    // Coins and tools.
    ctx.fillStyle = PALETTE.coin;
    ctx.font = '700 16px ' + FONT;
    ctx.textAlign = 'left';
    ctx.fillText(`Koin: ${state.coins}`, 850, 30);
    ctx.fillStyle = PALETTE.text;
    ctx.font = '600 12px ' + FONT;
    ctx.fillText(`[1] Asap ${TOOLS.smoke.cost} koin${state.smokeTime > 0 ? ` (${Math.ceil(state.smokeTime)} dtk)` : ''}`, 850, 50);
    ctx.fillText(`[2] Jammer ${TOOLS.jammer.cost} koin${state.jammerTime > 0 ? ` (${Math.ceil(state.jammerTime)} dtk)` : ''}`, 1010, 50);
    ctx.fillStyle = state.hasDiamond ? PALETTE.diamond : PALETTE.muted;
    ctx.font = '700 13px ' + FONT;
    ctx.fillText(state.hasDiamond ? '◆ Berlian didapat — KABUR!' : '◆ Berlian belum didapat', 1010, 30);

    if (screen === SCREEN_PAUSED) {
      ctx.fillStyle = 'rgba(0,0,0,0.55)';
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      drawOverlay('JEDA', 'Tekan P atau Spasi untuk lanjut. Rencanakan langkahmu.');
    }
  }

  function drawOverlay(title, subtitle, detail) {
    ctx.fillStyle = 'rgba(8, 9, 13, 0.72)';
    ctx.fillRect(0, HUD_HEIGHT, FIELD.width, FIELD.height - HUD_HEIGHT);
    ctx.fillStyle = PALETTE.text;
    ctx.font = '700 46px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText(title, FIELD.width / 2, 320);
    if (subtitle) {
      ctx.fillStyle = PALETTE.muted;
      ctx.font = '600 18px ' + FONT;
      ctx.fillText(subtitle, FIELD.width / 2, 356);
    }
    if (detail) {
      ctx.fillStyle = PALETTE.text;
      ctx.font = '600 16px ' + FONT;
      ctx.fillText(detail, FIELD.width / 2, 392);
    }
  }

  function drawTitle(state, best) {
    drawOverlay('MALAM DI MUSEUM SARI',
      'Rani menyelinap ke museum tengah malam. Lewati penjaga dan CCTV,',
      'curi Berlian Sari, lalu kabur lewat pintu keluar sebelum alarm 100%.');
    ctx.fillStyle = PALETTE.text;
    ctx.font = '600 16px ' + FONT;
    ctx.textAlign = 'center';
    ctx.fillText('WASD / panah bergerak  •  klik untuk jalan ke titik itu  •  [1] asap  •  [2] jammer  •  P jeda', FIELD.width / 2, 440);
    ctx.fillStyle = PALETTE.thief;
    ctx.font = '700 20px ' + FONT;
    ctx.fillText('Tekan Spasi atau klik untuk mulai', FIELD.width / 2, 486);
    if (best > 0) {
      ctx.fillStyle = PALETTE.muted;
      ctx.font = '600 14px ' + FONT;
      ctx.fillText(`Loot terbaik: ${best} koin`, FIELD.width / 2, 518);
    }
  }

  /** Paint one frame: the floor, the actors, the HUD, and the screen overlay. */
  function draw(state, screen, best) {
    ctx.clearRect(0, 0, FIELD.width, FIELD.height);
    ctx.fillStyle = PALETTE.backdrop;
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    drawRoomFloors();
    drawWallsAndCases(state);
    drawExit(state);
    drawLoot(state);
    drawCameras(state);
    drawGuards(state);
    drawThief(state);
    drawHud(state, screen);
    if (screen === SCREEN_TITLE) drawTitle(state, best);
    else if (screen === SCREEN_WIN) {
      drawOverlay('KABUR!', 'Berlian Sari berhasil dibawa pulang.', `Loot: ${state.coins} koin — tekan Spasi untuk main lagi.`);
    } else if (screen === SCREEN_CAUGHT) {
      drawOverlay('KETAHUAN!', 'Alarm 100% — museum terkunci, Rani tertangkap.',
        `Loot: ${state.coins} koin — tekan Spasi untuk coba lagi.`);
    }
  }

  return { draw };
}
