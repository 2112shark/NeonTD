// Shared types for the game, checked by `npm run typecheck` (JS files opt in with // @ts-check via tsconfig checkJs).
// Data tables (TD, ED, MISSIONS, ...) are typed by inference from their literals; this file covers runtime objects.

type TowerDefs = typeof import('./data/towers.js').TD;
type EnemyDefs = typeof import('./data/enemies.js').ED;
type TowerType = keyof TowerDefs;
type EnemyType = keyof EnemyDefs;
type Mission = (typeof import('./data/campaign.js').MISSIONS)[number];
type ChallengeCfg = { key: string; mi: number; mods: string[]; ban: string | null; gold: number; waves: number; weekly?: boolean };
type AbilityId = 'orbital' | 'emp' | 'shield';
type Tile = [number, number];

interface Point { x: number; y: number }

interface Route {
  pts: Tile[];
  path: Point[];
  air: Point[];
  len: number;
  airLen: number;
  core: number;
}

/** A map after prepMap: classic maps and every mission map. */
interface GameMap {
  name: string;
  lay: string;
  seed: number;
  th: string;
  hp?: number;
  ready: boolean;
  routes: Route[];
  fork: number | null;
  /** [row][col]: 0 free, 1 path, 2 decoration, 3 power node, 4 debris */
  grid: number[][];
  cores: Point[];
  gates: Point[];
  nodes: Tile[];
  debris: Tile[];
  nodeN?: number;
  debrisN?: number;
  path: Point[];
  air: Point[];
  airLen: number;
  len: number;
  [k: string]: any;
}

interface Tower {
  type: TowerType;
  c: number; r: number; x: number; y: number;
  lvl: number;
  /** specialization branch after level 3 */
  br: 'A' | 'B' | null;
  cd: number; rc: number; ang: number; mode: number;
  spent: number; kills: number;
  fm: number;
  beams: any[];
  syn: any[];
  jam: number; off: number; vet: number;
  node: boolean;
  skin: string | null;
  /** credits produced (generator) */
  made?: number;
  /** generators boosting this tower */
  gens?: Tower[];
}

interface Enemy {
  t: EnemyType;
  d: EnemyDefs[EnemyType] & Record<string, any>;
  hp: number; max: number;
  sh: number; msh: number;
  spd: number; armor: number;
  air: boolean;
  rt: Route;
  path: Point[];
  i: number; x: number; y: number;
  prog: number; len: number;
  rw: number;
  slowT: number; slow: number; stun: number; frz: number; brit: number;
  shT: number; hitT: number; ang: number; wob: number;
  dead: boolean;
  regen: number;
  cloak: boolean; vis: boolean;
  born: number; cd: number; phase: number;
  /** grounded by a gravity tower: seconds left */
  gnd?: number;
  /** gravity well pull: seconds left and strength */
  wellT?: number; wellP?: number;
  /** distance already dragged back by wells */
  dragD?: number;
}

/** Short-lived visual effect */
interface Fx { k: string; x?: number; y?: number; r?: number; life: number; max: number; col: string; [k: string]: any }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; col: string; size: number; g?: number }
interface FloatText { [k: string]: any }
interface SynLink { a: Tower; b: Tower; col: string; gen?: number }
interface QueuedEnemy { t: EnemyType; d: number; l: number }

/** The current run. Replaced wholesale by newGame(). */
interface RunState {
  mi: number;
  mode: 'campaign' | 'endless' | 'daily' | 'weekly';
  daily: ChallengeCfg | null;
  mis: Mission | null;
  /** nightmare mode */
  nm: boolean;
  map: GameMap;
  /** "flow" missions: one continuous stream instead of waves */
  flow: boolean;
  lives: number; maxLives: number;
  /** per-core health on maps with several cores, otherwise null */
  coreHp: number[] | null;
  coreMax: number;
  gold: number;
  wave: number;
  towers: Tower[];
  enemies: Enemy[];
  proj: any[];
  fx: Fx[];
  parts: Particle[];
  texts: FloatText[];
  queue: QueuedEnemy[];
  spawnT: number;
  waveActive: boolean;
  countdown: number;
  /** selected tower */
  sel: Tower | null;
  /** tower type being placed from the panel */
  place: TowerType | null;
  hover: Tile | null;
  paused: boolean;
  over: boolean | string;
  time: number;
  kills: number;
  started: boolean;
  /** open radial ring */
  rad: { c: number; r: number; deb: boolean } | null;
  preview: { type: string; c: number; r: number } | null;
  /** item highlighted in the radial ring */
  rsel: string | null;
  /** ability waiting for a target */
  aim: AbilityId | null;
  ab: Record<AbilityId, number>;
  shieldT: number; shieldBlocks: number;
  strikes: any[];
  links: SynLink[];
  curMods: string[];
  built: Set<string>;
  sold: boolean;
  early: number;
  newAch: string[];
  lost: number;
  tut: { step: number; [k: string]: any } | null;
  pts0: number;
  allowed: string[];
  limit: number;
  peak: number;
  abilUsed: number;
  specd: boolean;
  perks: string[];
  perkPick: any[] | null;
  focus: { e: Enemy; t: number } | null;
  /** fork switch position */
  sw: number;
  bshots: any[];
  said: Record<string, any>;
  flowLeft: number; flowNext: number; flowPerk: number;
  bossT: number | null;
  guardW: number;
  leakAir: number; leakGround: number;
  grid: number[][];
  wells: any[];
  cleared: number;
  xpGain: number;
  newTiers: any[];
  mast0: Record<string, number>;
  gens: number;
  seed: number;
  // set later during the run
  lastUp?: { t: Tower; diff: any[]; name: string | null } | null;
  shake?: number;
  flash?: number;
  bossLaps?: number;
  bossLeak?: number;
  diffMul?: number;
  // set by endGame
  won?: boolean;
  newRec?: boolean;
  mastUp?: [string, number][];
}

/** Persistent player progress, saved to localStorage and merged with the cloud copy. */
interface Progress {
  v?: number;
  ts: number;
  stars: Record<string, number>;
  /** mission star bitmasks */
  ms: Record<string, number>;
  ach: Record<string, any>;
  lab: Record<string, number>;
  waves: number; kills: number;
  specs: string[]; mods: string[];
  best: Record<string, number>;
  daily: { key: string; best: number; won: boolean; [k: string]: any } | null;
  dailyWins: number;
  tut: number;
  set: { sound: boolean; vib: boolean; [k: string]: any };
  streak: any;
  seenAch: number; legacy: number; bonus: number;
  q: any;
  st: Record<string, any>;
  seenE: Record<string, any>;
  own: Record<string, any>;
  skin: Record<string, any>;
  kfx: string;
  title: string;
  show: string[];
  season: { id: number; xp: number; got: number; e2?: number; [k: string]: any } | null;
  weekly: { key: string; best: number; plays: number } | null;
  buy: Record<string, number>;
  refund: Record<string, number>;
  [k: string]: any;
}

interface Window {
  /** Claude artifact runtime; absent outside Claude */
  claude?: { use(name: string): Promise<any> };
  webkitAudioContext?: typeof AudioContext;
  /** debug and test handle, see src/testHook.js */
  __td: any;
}
