// Player actions on the field: build, upgrade, sell.
import { COLS, ROWS } from './util.ts';
import { PROG } from '../meta/progress.ts';
import { saveProg } from '../meta/net.ts';
import { S } from './state.ts';
import { unlock } from '../meta/achievements.ts';
import { TD, TW_UNLOCK, TYPES } from '../data/towers.ts';
import { skinFor } from '../meta/mastery.ts';
import { recomputeSyn, sellRate, stats, tcost, towerAt, ucost } from './stats.ts';
import { snd } from '../audio/sfx.ts';
import { toast } from '../ui/comms.ts';
import { burst, text } from './combat.ts';
import { qev } from '../meta/quests.ts';
import { tutEvent } from '../ui/tutorial.ts';
import { SHORT, dFmt, statDiff } from '../ui/towerCard.ts';
import { SPEC_COL } from '../render/towers.ts';
import { ACC, vib } from '../ui/lobby/shared.ts';

/* ---------- actions ---------- */
export function canBuild(c: number,r: number){return c>=0&&r>=0&&c<COLS&&r<ROWS&&(S.grid[r][c]===0||S.grid[r][c]===3)&&!towerAt(c,r)}
export const isDebris=(c: number,r: number)=>c>=0&&r>=0&&c<COLS&&r<ROWS&&S.grid[r][c]===4;
/** is this tower type unlocked in the current mission */
export const shown=(k: TowerType)=>!S.mis||TW_UNLOCK[k]<=S.mis.i;
/** why this tower can't be built right now, or '' */
export function buildBlock(type: TowerType){
  if(!S.allowed.includes(type))return S.mis&&(S.mis.ban||[]).includes(type)?`${TD[type].name}: в этой миссии запрещено`:S.daily&&S.daily.ban===type?`Строить ${ACC[type]} в этом вызове нельзя`:`${TD[type].name} откроется позже`;
  if(S.limit&&S.towers.length>=S.limit)return`Лимит миссии: не больше ${S.limit} башен`;
  return'';
}
export function build(type: TowerType,c: number,r: number){
  const cost=tcost(type);if(buildBlock(type)||S.gold<cost||!canBuild(c,r))return false;
  S.gold-=cost;const t={type,c,r,x:c+.5,y:r+.5,lvl:1,br:null,cd:.2,rc:0,ang:-Math.PI/2,mode:0,spent:cost,kills:0,fm:1,beams:[],syn:[],jam:0,off:0,vet:0,node:S.grid[r][c]===3,skin:skinFor(type)};
  if(t.node&&!PROG.ach.node)unlock('node');
  S.towers.push(t);S.built.add(type);S.peak=Math.max(S.peak,S.towers.length);recomputeSyn();qev('build',1,t);
  S.fx.push({k:'ring',x:t.x,y:t.y,r:.8,life:.4,max:.4,col:TD[type].col});burst(t.x,t.y,TD[type].col,12,1.8,.45,.06);snd('build');vib(12);
  const gained=S.links.filter(l=>l.a===t||l.b===t);if(gained.length)toast('Синергия активна');
  tutEvent('build');return true;
}
/** next level, or specialization br after level 3 */
export function upgrade(t: Tower,br?: 'A'|'B'){
  const d=TD[t.type],before=stats(t);let cost: number;
  if(t.lvl<3){cost=ucost(t);if(S.gold<cost){toast('Не хватает кредитов');return false}t.lvl++}
  else if(!t.br&&br){cost=ucost(t,br);if(S.gold<cost){toast('Не хватает кредитов');return false}t.br=br;S.specd=true;unlock('spec');qev('spec',1);
    const key=t.type+br,sp=PROG.st.spec||(PROG.st.spec={});sp[key]=(sp[key]||0)+1;
    if(!PROG.specs.includes(key)){PROG.specs.push(key);saveProg()}if(PROG.specs.length>=TYPES.length*2)unlock('allspec')}
  else return false;
  qev('up',1);
  S.gold-=cost;t.spent+=cost;const ac=t.br?SPEC_COL[t.type+t.br]:d.col;S.fx.push({k:'ring',x:t.x,y:t.y,r:1,life:.5,max:.5,col:ac});burst(t.x,t.y,ac,22,2.4,.65,.07);snd('up');vib(20);
  const after=stats(t);let n=0;
  const diff=statDiff(t.type,before,after);S.lastUp={t,diff,name:br&&t.br===br?d.br[br].name:null};
  if(S.lastUp.name){text(t.x,t.y-.8,S.lastUp.name,ac,.36,1.7);n=1}
  for(const x of diff){if(n>=3)break;text(t.x,t.y-.8-n*.42,`${dFmt(x.k,x.d)} ${SHORT[x.k]}`,x.good?'#6dff9e':'#ff8a7a',.32,1.7);n++}
  tutEvent('upgrade');return true;
}
export function sell(t: Tower){
  const v=Math.floor(t.spent*sellRate());S.gold+=v;S.towers=S.towers.filter(x=>x!==t);S.sold=true;recomputeSyn();
  text(t.x,t.y,'+'+v,'#ffc94d',.34);burst(t.x,t.y,'#8894c0',12,1.6,.5,.06);snd('sell');
}
