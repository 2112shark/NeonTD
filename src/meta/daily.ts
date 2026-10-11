// Daily challenge: date keys and daily config.
import { hashS, rng } from '../core/util.ts';
import { S } from '../core/state.ts';
import { TYPES } from '../data/towers.ts';
import { MODS } from '../data/enemies.ts';

/** local date as YYYY-MM-DD */
export function dayKey(d?: Date){d=d||new Date();return`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
/** ISO week as YYYY-Www */
export function weekKey(d?: Date){d=d||new Date();const t=new Date(d.getFullYear(),d.getMonth(),d.getDate());t.setDate(t.getDate()-(t.getDay()+6)%7+3);
  const y=t.getFullYear(),j=new Date(y,0,4),mon1=new Date(y,0,4-(j.getDay()+6)%7);return`${y}-W${String(Math.floor(Math.round((+t-+mon1)/864e5)/7)+1).padStart(2,'0')}`}
/** the daily challenge for a day; the same key always gives the same challenge */
export function dailyCfg(key?: string): ChallengeCfg{key=key||dayKey();const R=rng(hashS(key));
  const mi=R()*3|0,keys=Object.keys(MODS) as ModId[],mods: ModId[]=[];while(mods.length<2){const k=keys[R()*keys.length|0];if(!mods.includes(k))mods.push(k)}
  let ban=R()<.6?TYPES[R()*TYPES.length|0]:null;const gold=220+(R()*4|0)*40;
  if(mods.includes('cloak')&&(ban==='cryo'||ban==='tesla'))ban=null;
  return{key,mi,mods,ban,gold,waves:20}}
export function dailyScore(won: boolean){return S.kills*10+S.lives*150+S.wave*100+(won?2000:0)}
