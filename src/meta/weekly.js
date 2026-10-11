// Weekly challenge and leagues.
import { hashS, rng } from '../core/util.js';
import { PROG } from './progress.js';
import { lbSubmit } from './net.js';
import { S } from '../core/state.js';
import { unlock } from './achievements.js';
import { MODS } from '../data/enemies.js';
import { weekKey } from './daily.js';
import { addXP, seasonInfo } from './season.js';

/* ---------- weekly challenge and leagues ---------- */
export function weeklyCfg(key){key=key||weekKey();const R=rng(hashS('wk'+key)),def=seasonInfo().def,keys=Object.keys(MODS).filter(k=>k!==def.mod),mods=[def.mod,keys[R()*keys.length|0]],mi=R()*3|0;
  return{key,mi,mods,ban:null,gold:300,waves:40,weekly:true}}
export const LEAGUES=[['Бронза',0,'#d08a4a'],['Серебро',8000,'#c8d2e8'],['Золото',17000,'#ffc94d'],['Платина',26000,'#7fe4ff'],['Неон',33000,'#ff4fd8']];
export function leagueOf(sc){let i=0;while(i+1<LEAGUES.length&&sc>=LEAGUES[i+1][1])i++;return i}
export function weeklyEnd(score,won){const k=S.daily.key;let w=PROG.weekly;if(!w||w.key!==k)w=PROG.weekly={key:k,best:0,plays:0};
  w.plays++;const nb=score>w.best;w.best=Math.max(w.best,score);unlock('weekly');if(leagueOf(w.best)>=2)unlock('goldl');addXP(40);
  if(nb)lbSubmit(w.best,won,S.wave);return{best:w.best,newBest:nb}}
