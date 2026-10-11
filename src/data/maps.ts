// Route layouts and classic maps.
/* ---------- data ---------- */
// Route layouts: each route is a list of waypoints in tile coordinates. Two routes with different ends give two cores,
// routes that share a start and an end form a fork with a switch at waypoint `fork`.
/** A route layout: waypoint lists in tile coordinates, `fork` marks the switch waypoint */
export interface Layout { r: [number, number][][]; fork?: number }
/** A classic map before prepMap; prepMap adds routes, grid and the rest (see GameMap) */
export interface MapDef {
  name: string; sub?: string; hp?: number; seed: number;
  /** visual theme */
  th: string;
  zone?: string; diff?: string;
  lay: string;
  nodeN?: number; debrisN?: number;
}
export const LAY: Record<string, Layout>={
 ring:{r:[[[-1,2],[9,2],[9,6],[2,6],[2,10],[9,10],[9,15]]]},
 serp:{r:[[[2,-1],[2,3],[9,3],[9,7],[4,7],[4,11],[10,11],[10,13],[1,13],[1,15]]]},
 breach:{r:[[[-1,7],[5,7],[5,2],[8,2],[8,12],[3,12],[3,15]]]},
 zig:{r:[[[10,-1],[10,2],[1,2],[1,5],[10,5],[10,8],[1,8],[1,11],[10,11],[10,15]]]},
 hook:{r:[[[-1,12],[3,12],[3,3],[8,3],[8,9],[12,9]]]},
 spiral:{r:[[[-1,1],[10,1],[10,13],[1,13],[1,4],[7,4],[7,10],[4,10],[4,7]]]},
 cross:{r:[[[-1,4],[9,4],[9,10],[4,10],[4,1],[12,1]]]},
 twin:{r:[[[5,-1],[5,2],[1,2],[1,7],[3,7],[3,12],[1,12]],[[6,-1],[6,2],[10,2],[10,7],[8,7],[8,12],[10,12]]]},
 rails:{r:[[[-1,2],[10,2],[10,7],[1,7],[1,12],[12,12]]]},
 fork:{r:[[[5,-1],[5,2],[1,2],[1,8],[5,8],[5,12],[10,12],[10,15]],[[5,-1],[5,2],[10,2],[10,8],[5,8],[5,12],[10,12],[10,15]]],fork:1},
 nest:{r:[[[-1,13],[10,13],[10,9],[1,9],[1,5],[10,5],[10,1],[-1,1]]]},
 loop:{r:[[[12,2],[2,2],[2,12],[9,12],[9,6],[5,6],[5,15]]]},
 circuit:{r:[[[-1,12],[2,12],[2,2],[5,2],[5,10],[9,10],[9,1],[12,1]]]},
 twin2:{r:[[[1,-1],[1,4],[4,4],[4,10],[1,10],[1,14]],[[10,-1],[10,4],[7,4],[7,10],[10,10],[10,14]]]},
 reactor:{r:[[[12,1],[2,1],[2,5],[9,5],[9,9],[2,9],[2,13],[12,13]]]},
};
// classic maps: endless mode, daily and weekly challenges
// prepared in place by core/map at startup, so the rest of the game sees full GameMaps
export const MAPS=([
 {name:'Кольцо',sub:'Длинный извилистый путь: у башен много времени на стрельбу.',hp:1.6,seed:11,th:'net',zone:'Сетевой узел',diff:'Легко',lay:'ring',nodeN:2,debrisN:2},
 {name:'Серпантин',sub:'Много поворотов и узких мест. Враги на четверть крепче, чем на Кольце.',hp:2,seed:23,th:'srv',zone:'Серверная',diff:'Средне',lay:'serp',nodeN:2,debrisN:2},
 {name:'Прорыв',sub:'Короткий путь, а враги почти вдвое крепче. Плотная оборона нужна с первых волн.',hp:2.9,seed:37,th:'hot',zone:'Реакторный отсек',diff:'Сложно',lay:'breach',nodeN:2,debrisN:2},
] satisfies MapDef[]) as unknown as GameMap[];
