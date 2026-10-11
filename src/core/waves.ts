// Wave composition, enemy health scaling and wave modifiers.
import { MAXW, rng } from './util.ts';
import { S } from './state.ts';
import { BOSSES, MODS } from '../data/enemies.ts';
import { NM } from '../data/campaign.ts';

/** enemy health multiplier for wave w */
export function hpMul(w: number){const k=w-1,M=S.mis;
  const base=M?M.hp*(S.nm?M.nmh||NM.hp:1):S.map.hp!;
  return(1+k*.2+k*k*.024)*base*(S.diffMul||1)*(S.mode==='daily'?.8:1)*(w>MAXW?Math.pow(1.07,w-MAXW):1)}
/** modifiers active on wave w */
export function waveMods(w: number){const out: ModId[]=[],keys=(Object.keys(MODS) as ModId[]).filter(k=>k!=='cloak'||!S.allowed||S.allowed.includes('cryo')||S.allowed.includes('tesla'));
  if(S.daily){if(w>=3)out.push(...S.daily.mods);return out}
  if(S.mis){if(S.nm&&w>=2){const R=rng(w*53+S.mis.i*977+11);out.push(keys[R()*keys.length|0]);
      if(w>=Math.max(8,(S.mis.waves||18)-2)&&R()<.5){const k=keys[R()*keys.length|0];if(!out.includes(k))out.push(k)}}
    return out}
  if(w<6)return out;const R=rng(w*31+S.mi*7+3);
  if(R()<=.45||w>MAXW)out.push(keys[R()*keys.length|0]);
  if(w>40&&R()<.5){const k=keys[R()*keys.length|0];if(!out.includes(k))out.push(k)}
  return out}
export const maxW=()=>S.mode==='endless'||S.flow?Infinity:S.mis?S.mis.waves:S.daily?S.daily.waves:MAXW;
const WQ: Record<string, QueuedEnemy[]>={};
/** the spawn queue for wave w; cached, returns a fresh copy */
export function genWave(w: number){const k=S.mode+':'+(S.mis?S.mis.id+(S.nm?'n':''):S.mi)+':'+(S.daily?S.daily.key:'')+':'+w;if(!WQ[k])WQ[k]=genWave0(w);return WQ[k].map(o=>({...o}))}
// endless mode roster: enemy type and the first wave it shows up in
const CLASSIC_T: [EnemyType, number][]=[['drone',1],['scout',2],['tank',4],['wasp',5],['guard',7],['medic',8],['split',9],['blink',11],['jammer',13],['carrier',15]];
// group size by wave
const NUM: Partial<Record<EnemyType, (w: number)=>number>>={drone:w=>4+w/4,scout:w=>5+w/3,tank:w=>2+w/5,wasp:w=>4+w/4,guard:w=>4+w/4,split:w=>2+w/6,medic:w=>2+w/7,jammer:w=>1+w/8,blink:w=>3+w/5,carrier:w=>1+w/7};
// seconds between enemies of a group
const GAP: Partial<Record<EnemyType, number>>={scout:.45,tank:1.15,split:1.1,medic:.95,jammer:1.3,blink:.6,carrier:1.5};
function genWave0(w: number){
  const M=S.mis,R=rng(w*7919+(M?M.i*977+(S.nm?3:0)+40000:S.mi*131)+5),mods=waveMods(w);
  const types=M?(Object.keys(M.roster) as EnemyType[]).filter(k=>M.roster[k]!<=w).sort((a,b)=>M.roster[a]!-M.roster[b]!):CLASSIC_T.filter(x=>x[1]<=w).map(x=>x[0]);
  const lanes=S.map.cores.length>1?S.map.routes.length:1;
  const q: QueuedEnemy[]=[],groups=(S.flow?1:2)+Math.floor(w/(S.flow?6:5));
  for(let g=0;g<groups;g++){
    const t=g===0?types[types.length-1]:types[R()*types.length|0];
    let n=Math.floor(NUM[t]!(w)),gap=GAP[t]||.7;
    if(mods.includes('swarm')){n=Math.ceil(n*1.5);gap*=.7}
    const l=(g+w)%lanes;
    for(let i=0;i<n;i++)q.push({t,d:i===0?(g===0?1:2.2):gap,l});
  }
  const boss=M?(M.boss&&w===M.waves?M.boss:null):(w%10===0?BOSSES[(w/10-1)%3]:null);
  if(boss)q.push({t:boss,d:2.5,l:0});
  return q;
}
