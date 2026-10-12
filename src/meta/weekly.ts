// Weekly challenge and leagues.
import { hashS, rng } from '../core/util.ts';
import { PROG } from './progress.ts';
import { lbSubmit } from './net.ts';
import { S } from '../core/state.ts';
import { unlock } from './achievements.ts';
import { MODS } from '../data/enemies.ts';
import { weekKey } from './daily.ts';
import { addXP, seasonInfo } from './season.ts';

/* ---------- weekly challenge and leagues ---------- */
/** the weekly challenge: the season's modifier plus one more, 40 waves */
export function weeklyCfg(key?: string): ChallengeCfg{key=key||weekKey();const R=rng(hashS('wk'+key)),def=seasonInfo().def,keys=(Object.keys(MODS) as ModId[]).filter(k=>k!==def.mod),mods: ModId[]=[def.mod,keys[R()*keys.length|0]],mi=R()*3|0;
  return{key,mi,mods,ban:null,gold:300,waves:40,weekly:true}}
/** name, minimum weekly score, color */
export const LEAGUES: [string, number, string][]=[['Бронза',0,'#d08a4a'],['Серебро',8000,'#c8d2e8'],['Золото',17000,'#ffc94d'],['Платина',26000,'#7fe4ff'],['Неон',33000,'#ff4fd8']];
export function leagueOf(sc: number){let i=0;while(i+1<LEAGUES.length&&sc>=LEAGUES[i+1][1])i++;return i}
/** record a weekly run; submits a new best to the leaderboard */
export function weeklyEnd(score: number,won: boolean){const k=S.daily!.key;let w=PROG.weekly;if(!w||w.key!==k)w=PROG.weekly={key:k,best:0,plays:0};
  w.plays++;const nb=score>w.best;w.best=Math.max(w.best,score);unlock('weekly');if(leagueOf(w.best)>=2)unlock('goldl');addXP(40);
  if(nb)lbSubmit(w.best,won,S.wave);return{best:w.best,newBest:nb}}
