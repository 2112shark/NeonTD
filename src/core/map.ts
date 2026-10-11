// Turns route layouts into playable maps: paths, grid, cores, gates, nodes, debris.
import { COLS, ROWS, clamp, d2, rng } from './util.ts';
import { LAY, MAPS, type MapDef } from '../data/maps.ts';
import { TW_UNLOCK, TYPES } from '../data/towers.ts';
import { CHAPTERS, MISSIONS } from '../data/campaign.ts';

function mkRoute(pts: Tile[]): Route{
  const path=pts.map(p=>({x:p[0]+.5,y:p[1]+.5}));let len=0;for(let i=1;i<path.length;i++)len+=Math.sqrt(d2(path[i],path[i-1]));
  const air=path.filter((_p,i)=>i%2===0||i===path.length-1);let airLen=0;for(let i=1;i<air.length;i++)airLen+=Math.sqrt(d2(air[i],air[i-1]));
  return{pts,path,air,len,airLen,core:0};
}
function prepMap(m: MapDef & Partial<GameMap>): GameMap{
  if(m.ready)return m as GameMap;const L=LAY[m.lay];
  const routes=m.routes=L.r.map(mkRoute);m.fork=L.fork==null?null:L.fork;
  const grid=m.grid=[...Array(ROWS)].map(()=>Array<number>(COLS).fill(0));
  const inb=(x: number,y: number)=>x>=0&&y>=0&&x<COLS&&y<ROWS;
  for(const rt of routes)for(let i=0;i<rt.pts.length-1;i++){
    let [x,y]=rt.pts[i];const [x1,y1]=rt.pts[i+1];const sx=Math.sign(x1-x),sy=Math.sign(y1-y);
    for(;;){if(inb(x,y))grid[y][x]=1;if(x===x1&&y===y1)break;x+=sx;y+=sy}
  }
  const same=(a: Point,x: number,y: number)=>Math.abs(a.x-x)<.01&&Math.abs(a.y-y)<.01;
  const cores: Point[]=m.cores=[],gates: Point[]=m.gates=[];
  for(const rt of routes){const e=rt.path[rt.path.length-1],x=clamp(e.x,.5,COLS-.5),y=clamp(e.y,.5,ROWS-.5);
    let k=cores.findIndex(c=>same(c,x,y));if(k<0){k=cores.length;cores.push({x,y})}rt.core=k;
    const s=rt.path[0],gx=clamp(s.x,.5,COLS-.5),gy=clamp(s.y,.5,ROWS-.5);if(!gates.some(g=>same(g,gx,gy)))gates.push({x:gx,y:gy})}
  const R=rng(m.seed);let n=0,g=0;
  while(n<11&&g++<800){const c=R()*COLS|0,r=R()*ROWS|0;if(grid[r][c])continue;
    let near=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(inb(c+dx,r+dy)&&grid[r+dy][c+dx]===1)near=true;
    if(!near){grid[r][c]=2;n++}}
  const nodes: Tile[]=m.nodes=[],debris: Tile[]=m.debris=[];
  const R2=rng(m.seed+555),cand: Tile[]=[];
  for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(grid[r][c]!==0)continue;let adj=false;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if(inb(c+dx,r+dy)&&grid[r+dy][c+dx]===1)adj=true;if(adj)cand.push([c,r])}
  const take=()=>cand.length?cand.splice(R2()*cand.length|0,1)[0]:null;
  for(let k=0;k<(m.nodeN||0);k++){const q=take();if(q){grid[q[1]][q[0]]=3;nodes.push(q)}}
  for(let k=0;k<(m.debrisN||0);k++){const q=take();if(q){grid[q[1]][q[0]]=4;debris.push(q)}}
  const r0=routes[0];m.path=r0.path;m.air=r0.air;m.airLen=r0.airLen;m.len=Math.max(...routes.map(r=>r.len));
  m.ready=true;return m as GameMap;
}
MAPS.forEach(prepMap);
MISSIONS.forEach((M,i)=>{M.i=i;M.map=prepMap({name:M.name,lay:M.lay,seed:101+i*17,th:CHAPTERS[M.ch].th,nodeN:M.nodeN||0,debrisN:M.debrisN||0})});
export const mFlag=(M: Mission)=>M.goal==='flow';
export function allowedFor(M: Mission){return TYPES.filter(k=>TW_UNLOCK[k]<=M.i&&!(M.ban||[]).includes(k))}
