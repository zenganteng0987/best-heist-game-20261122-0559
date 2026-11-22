// Every tuning number and colour for Malam di Museum Sari, in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** Height of the HUD bar at the top; the museum floor starts below it. */
export const HUD_HEIGHT = 64;

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

export const THIEF = {
  radius: 13,
  speed: 178,
  startX: 64,
  startY: 392,
};

export const GUARD = {
  radius: 13,
  patrolSpeed: 72,
  chaseSpeed: 168,
  catchDistance: 22,
  /** How long a guard keeps chasing after losing sight, in seconds. */
  loseSightTime: 2.5,
  /** How long a guard searches the last seen spot before walking back. */
  searchTime: 2.0,
  /** Vision cone: how far and how wide a guard can see. */
  sightRange: 230,
  sightHalfAngle: Math.PI / 5,
};

export const CAMERA = {
  sightRange: 210,
  sightHalfAngle: Math.PI / 7,
  /** Seconds for one full sweep out and back. */
  sweepPeriod: 5.0,
  /** How far, in radians, a camera sweeps either side of its base angle. */
  sweepArc: Math.PI / 3.2,
};

export const ALARM = {
  max: 100,
  /** Points per second while a guard has eyes on the thief. */
  guardRate: 46,
  /** Points per second while a camera has eyes on the thief. */
  cameraRate: 30,
  /** Points per second the alarm cools down while nobody sees the thief. */
  decayRate: 7,
};

export const TOOLS = {
  smoke: { cost: 50, duration: 4, key: '1' },
  jammer: { cost: 75, duration: 6, key: '2' },
};

export const LOOT = {
  coinValue: 25,
  diamondValue: 500,
};

export const PALETTE = {
  backdrop: '#0d0f14',
  floorGallery: '#232030',
  floorCorridor: '#1e2b26',
  floorVault: '#2b2118',
  carpet: '#3a2f4d',
  wall: '#4a4458',
  wallEdge: '#6b6480',
  caseGlass: '#7fb3d5',
  caseBase: '#54432a',
  pedestal: '#8a6d3b',
  thief: '#e8b93c',
  thiefCoat: '#2f6db3',
  guard: '#c94f43',
  guardUniform: '#5a3d3d',
  camera: '#9aa5b1',
  coneGuard: 'rgba(233, 79, 67, 0.28)',
  coneCamera: 'rgba(240, 196, 60, 0.22)',
  coneSeen: 'rgba(255, 60, 40, 0.45)',
  coin: '#f2c94c',
  diamond: '#7fe7f2',
  exit: '#58c96b',
  panel: '#171a21',
  panelEdge: '#2c313d',
  text: '#eef1f5',
  muted: '#9aa3b2',
  danger: '#ff5a4a',
  safe: '#58c96b',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best loot total is kept between visits (this browser only). */
export const BEST_KEY = 'malam-di-museum-sari.best';
