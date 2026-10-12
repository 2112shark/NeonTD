// Shared types for the game, checked by `npm run typecheck` (JS files opt in with // @ts-check via tsconfig checkJs).
// Data tables (TD, ED, MISSIONS, ...) are typed by inference from their literals; this file covers runtime objects.

type TowerType = import('./data/towers.ts').TowerType;
type EnemyType = import('./data/enemies.ts').EnemyType;
type EnemyDef = import('./data/enemies.ts').EnemyDef;
type ModId = import('./data/enemies.ts').ModId;
type Mission = import('./data/campaign.ts').Mission;
type AbilityId = import('./data/abilities.ts').AbilityId;
/** daily and weekly challenge setup */
type ChallengeCfg = { key: string; mi: number; mods: ModId[]; ban: TowerType | null; gold: number; waves: number; weekly?: boolean };
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
  /** synergies this tower receives */
  syn: import('./data/towers.ts').Synergy[];
  jam: number; off: number; vet: number;
  node: boolean;
  skin: string | null;
  /** credits produced (generator) */
  made?: number;
  /** damage dealt */
  dmg?: number;
  /** laser focus: target held last frame */
  last?: Enemy;
  /** generators boosting this tower */
  gens?: Tower[];
}

/** enough of a tower to compute its stats: built towers and build previews */
type TowerLike = Pick<Tower, 'type' | 'lvl' | 'br'> & Partial<Tower>;

interface Enemy {
  t: EnemyType;
  d: EnemyDef;
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
  gnd: number;
  /** gravity well pull: seconds left and strength */
  wellT: number; wellP: number;
  /** distance already dragged back by wells */
  dragD: number;
  /** took the other branch at a fork */
  forked?: boolean;
  /** Wrecker: gun angle */
  gunA?: number;
}

/** Short-lived visual effect */
interface Fx { k: string; x?: number; y?: number; r?: number; life: number; max: number; col: string; [k: string]: any }
interface Particle { x: number; y: number; vx: number; vy: number; life: number; max: number; col: string; size: number; g?: number }
/** floating text over the field: rewards, damage, status */
interface FloatText { x: number; y: number; s: string; col: string; size: number; life: number; max: number }
/** cannon shell in flight */
interface Projectile { x: number; y: number; sx: number; sy: number; tx: number; ty: number; p: number; dur: number; dmg: number; sp: number; src: Tower; h: number; delay: number; done?: boolean }
/** gravity well left by a Graviton */
interface Well { x: number; y: number; r: number; t: number; max: number; pull: number; dps: number; drag: number; boom: number; src: Tower; kind: string; done?: boolean }
/** Wrecker boss shot that disables a tower for `dis` seconds */
interface BossShot { sx: number; sy: number; x: number; y: number; t: Tower; p: number; dur: number; dis: number; done?: boolean }
/** orbital strike counting down to impact */
interface Strike { x: number; y: number; t: number; r: number; done?: boolean }
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
  proj: Projectile[];
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
  preview: { type: TowerType; c: number; r: number } | null;
  /** item highlighted in the radial ring */
  rsel: string | null;
  /** ability waiting for a target */
  aim: AbilityId | null;
  ab: Record<AbilityId, number>;
  shieldT: number; shieldBlocks: number;
  strikes: Strike[];
  links: SynLink[];
  curMods: ModId[];
  built: Set<string>;
  sold: boolean;
  early: number;
  newAch: string[];
  lost: number;
  tut: { step: number; [k: string]: any } | null;
  pts0: number;
  allowed: TowerType[];
  limit: number;
  peak: number;
  abilUsed: number;
  specd: boolean;
  perks: string[];
  perkPick: any[] | null;
  focus: { e: Enemy; t: number } | null;
  /** fork switch position */
  sw: number;
  bshots: BossShot[];
  said: Record<string, any>;
  flowLeft: number; flowNext: number; flowPerk: number;
  bossT: number | null;
  guardW: number;
  leakAir: number; leakGround: number;
  grid: number[][];
  wells: Well[];
  cleared: number;
  xpGain: number;
  newTiers: any[];
  mast0: Record<string, number>;
  gens: number;
  seed: number;
  // set later during the run
  lastUp?: { t: Tower; diff: any[]; name: string | null } | null;
  /** screen shake and red flash timers */
  shake: number;
  flash: number;
  bossLaps?: number;
  bossLeak?: number;
  diffMul?: number;
  // set by endGame
  won?: boolean;
  newRec?: boolean;
  mastUp?: [string, number][];
}

/** one quest in progress: target n, progress p, claimed c */
interface QuestProgress { id: string; n: number; p: number; c: number }
/** today's three quests and this week's quest */
interface QuestState { day: string; list: QuestProgress[]; wkk?: string | null; wk?: QuestProgress | null; bonus?: number }

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
  q: QuestState | null;
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
