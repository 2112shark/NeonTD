// Tower stats, costs, auras and synergies.
import { S } from './state.js';
import { lab } from '../meta/lab.js';
import { unlock } from '../meta/achievements.js';
import { SYN, TD } from '../data/towers.ts';
import { mastB, vetB } from '../meta/mastery.js';

export const towerAt=(c,r)=>S.towers.find(t=>t.c===c&&t.r===r);
export const hasP=k=>!!(S&&S.perks.includes(k));
// generator aura that reaches a tower: the strongest working generator on a neighbouring tile
export function genAura(t){if(t.type==='gen'||!t.gens||!t.gens.length)return null;let best=null;
  for(const u of t.gens){if(u.off>0||u.jam>0)continue;const s={};for(let i=0;i<u.lvl;i++)Object.assign(s,TD.gen.lv[i]);if(u.br)Object.assign(s,TD.gen.br[u.br]);
    const a=s.aura+(u.node?.04:0);if(!best||a>best.aura)best={aura:a,haste:s.haste||0}}return best}
export function stats(t){
  const d=TD[t.type],s={};for(let i=0;i<t.lvl;i++)Object.assign(s,d.lv[i]);if(t.br)Object.assign(s,d.br[t.br]);
  delete s.cost;delete s.name;delete s.desc;
  let m=1+.08*lab('dmg');if(hasP('dmg'))m*=1.12;if(hasP('lens')&&t.type==='laser')m*=1.2;
  if(t.node)m*=1.25;m*=1+vetB(t)+mastB(t.type);const ga=genAura(t);if(ga)m*=1+ga.aura;
  if(s.dps)s.dps*=m;if(s.dmg)s.dmg*=m;if(s.boom)s.boom*=m;
  if(s.range!=null)s.range+=(lab('rng')?.25:0)+(hasP('rng')?.3:0)+(t.node?.5:0);
  if(hasP('rate')){if(s.rate)s.rate*=.9;if(s.dps&&t.type!=='gravi')s.dps/=.9}
  if(ga&&ga.haste){if(s.rate)s.rate*=1-ga.haste;if(s.dps&&t.type==='laser')s.dps/=1-ga.haste}
  if(t.type==='gravi'&&hasP('heavy')){s.wr*=1.3;s.dur+=.6}
  if(t.type==='gen'){s.inc*=(t.node?1.25:1)*(hasP('divid')?1.5:1)*(1+mastB('gen'));if(t.node)s.aura+=.04}
  if(hasP('frost')&&s.slow!=null)s.slow+=.1;
  if(hasP('blast')&&s.splash)s.splash*=1.3;
  if(hasP('crit')&&s.crit!=null)s.crit+=.15;
  if(hasP('chain')&&s.chains)s.chains+=2;
  if(t.syn)for(const r of t.syn)r.f(s);
  return s;
}
export const tcost=type=>Math.round(TD[type].cost*(1-.05*lab('thr')));
export function ucost(t,br){const d=TD[t.type],c=br?d.br[br].cost:d.lv[t.lvl].cost;return Math.round(c*(hasP('cheap')?.85:1))}
export function synFor(type,c,r,self){
  const out=[];
  for(const rule of SYN){if(rule.to!==type)continue;
    if(S.towers.some(u=>u!==self&&u.type===rule.from&&Math.max(Math.abs(u.c-c),Math.abs(u.r-r))<=1))out.push(rule)}
  return out;
}
export function recomputeSyn(){
  S.links=[];let n=0;
  for(const t of S.towers){t.gens=t.type==='gen'?[]:S.towers.filter(u=>u.type==='gen'&&u!==t&&Math.max(Math.abs(u.c-t.c),Math.abs(u.r-t.r))<=1);
    for(const u of t.gens)S.links.push({a:u,b:t,col:TD.gen.col,gen:1})}
  for(const t of S.towers){t.syn=synFor(t.type,t.c,t.r,t);n+=t.syn.length;
    for(const rule of t.syn)for(const u of S.towers)if(u!==t&&u.type===rule.from&&Math.max(Math.abs(u.c-t.c),Math.abs(u.r-t.r))<=1&&!S.links.some(l=>(l.a===u&&l.b===t)||(l.a===t&&l.b===u)))S.links.push({a:u,b:t,col:TD[u.type].col})}
  if(n>=3)unlock('syn3');
}
export function sellRate(){return lab('rec')?.85:.7}
