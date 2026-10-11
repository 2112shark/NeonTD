// Lobby state and helpers shared by screens; SCR holds screen renderers.
import { PROG } from '../../meta/progress.js';
import { S } from '../../core/state.js';
import { labRaw, ptsFree } from '../../meta/lab.js';
import { MAPS } from '../../data/maps.ts';
import { BOSS_LAP, BOSS_LAP_HEAL, ED, MODS } from '../../data/enemies.ts';
import { MISSIONS, NM } from '../../data/campaign.ts';
import { QIDX } from '../../data/quests.ts';
import { maxW } from '../../core/waves.ts';
import { weekKey } from '../../meta/daily.ts';
import { S_MAX, seasonInfo, seasonState, seasonTier, tierCost, tierStart } from '../../meta/season.js';
import { LEAGUES, leagueOf, weeklyCfg } from '../../meta/weekly.js';
import { popc } from '../../core/endgame.js';
import { questReady, questState } from '../../meta/quests.js';
import { ACC, GEN, IC, MODE_RU, STAR, fmtN, fmtTime, plural, timeLeft, weekLeft } from './shared.js';

/* screens */
export const LBY={scr:null,back:'home',sel:0,labTab:0,codex:'towers',arm:null,booted:false,lock:0,day:'',center:null,chap:0,mis:0,nm:false,atab:'quests'};
export const SUB={daily:1,codex:1,mission:1,endless:1,profile:1,weekly:1};
export const resumable=()=>!!(S&&S.started&&!S.over);
const wavesTxt=()=>{const m=maxW();return m===Infinity?'∞':m};
export const runName=()=>S.mis?`Миссия ${S.mis.i+1}: ${S.mis.name}${S.nm?', кошмар':''}`:`${S.map.name}, ${MODE_RU[S.mode]}`;
export const runProg=()=>S.flow?`Поток, осталось ${fmtTime(Math.max(0,S.flowLeft))}`:`Волна ${S.wave} из ${wavesTxt()}`;
export const coresPill=()=>`<button class="cores" data-act="go:lab" aria-label="Ядра данных: ${ptsFree()}">${IC.core}<span>${ptsFree()}</span></button>`;
export const head=(t,back)=>`<header class="lb-head">${back?`<button class="back" data-act="back" aria-label="Назад">${IC.back}</button>`:''}<h2>${t}</h2>${coresPill()}</header>`;
export const starsMini=(n,cls)=>`<span class="mstars${cls?' '+cls:''}" role="img" aria-label="Звёзд: ${n} из 3">${[0,1,2].map(k=>`<svg viewBox="0 0 24 24" class="${k<n?'on':''}"><path d="${STAR}"/></svg>`).join('')}</span>`;
export const dailyChips=dc=>dc.mods.map(k=>`<span class="chip" style="--cc:${MODS[k].col}">${MODS[k].name}</span>`).join('')+(dc.ban?`<span class="chip" style="--cc:#ff4d6d">Без ${GEN[dc.ban]}</span>`:'');
/* campaign progress */
export const mDone=i=>!!PROG.ms[MISSIONS[i].id];
export const mOpen=i=>i===0||mDone(i-1);
export const mStars=(i,nm)=>popc(PROG.ms[(nm?'n':'')+MISSIONS[i].id]||0);
export const chapOpen=c=>{const f=MISSIONS.find(m=>m.ch===c);return mOpen(f.i)};
export function nextMission(){return MISSIONS.find(m=>!mDone(m.i))||null}
export function goalShort(M){switch(M.goal){
  case'limit':return`${M.waves} волн, не больше ${M.limit} башен`;
  case'ban':return`${M.waves} волн без ${M.ban.map(k=>GEN[k]).join(' и ')}`;
  case'cores':return`${M.waves} волн, два ядра`;
  case'flow':return`Поток: ${Math.round(M.flowT/60)} минуты без пауз`;
  case'boss':return`${M.waves} волн, в конце ${ED[M.boss].name}`;
  default:return`${M.waves} волн`}}
export function goalLong(M,nm){switch(M.goal){
  case'limit':return`Отбейте ${M.waves} волн, держа не больше ${M.limit} башен одновременно.`;
  case'ban':return`Отбейте ${M.waves} волн. Строить ${M.ban.map(k=>ACC[k]).join(' и ')} нельзя.`;
  case'cores':return`Отбейте ${M.waves} волн и сохраните оба ядра. Падение любого означает поражение.`;
  case'flow':return`Продержитесь ${Math.round(M.flowT/60)} минуты под непрерывным потоком врагов.`;
  case'boss':return nm?`Отбейте ${M.waves} волн и уничтожьте босса: ${ED[M.boss].name}. Если он дойдёт до ядра, миссия провалена.`:`Отбейте ${M.waves} волн и уничтожьте босса: ${ED[M.boss].name}. Прорвавшись к ядру, он отнимет ${BOSS_LAP} прочности, восстановит ${Math.round(BOSS_LAP_HEAL*100)}% здоровья и пойдёт на второй круг; второй прорыв означает поражение.`;
  default:return`Отбейте ${M.waves} волн и не дайте врагам разрушить ядро.`}}
function starText(c,M){const two=M.map.cores.length>1;switch(c.k){
  case'lives':return two?`Сохраните не меньше ${c.n} прочности у каждого ядра`:`Сохраните не меньше ${c.n} прочности ядра`;
  case'noabil':return'Не используйте способности';
  case'nosell':return'Ничего не продавайте';
  case'flawless':return'Не потеряйте ни единицы прочности';
  case'types':return`Стройте не больше ${c.n} типов башен`;
  case'towers':return`Держите не больше ${c.n} башен одновременно`;
  case'boss':return`Уничтожьте босса за ${c.n} с после появления`;
  case'early':return`Вызовите ${c.n} ${plural(c.n,['волну','волны','волн'])} досрочно`;
}return''}
export const starConds=M=>['Пройдите миссию',starText(M.s2,M),starText(M.s3,M)];
export const misGold=(M,nm)=>Math.round((M.gold+40*labRaw('cap'))*(nm?NM.gold:1));
export const misLives=M=>{const nc=M.map.cores.length,per=Math.round((20+5*labRaw('hp'))/(nc>1?2:1));return nc>1?`${per} и ${per}`:per};
export const SCR={};
export function seasonStrip(){const si=seasonInfo(),s=seasonState(),t=seasonTier(),f=t>=S_MAX?1:(s.xp-tierStart(t))/tierCost(t+1);
  return`<button class="sstrip" data-act="season" style="--zc:${si.def.col}"><span class="sl"><b>Сезон ${si.num}: ${si.def.name}</b><span>Ступень ${t} из ${S_MAX}</span></span><span class="sb"><i style="width:${Math.round(f*100)}%"></i></span></button>`}
export const weekRec=()=>{const k=weekKey();return PROG.weekly&&PROG.weekly.key===k?PROG.weekly:null};
export function weeklyCard(){const wc=weeklyCfg(),w=weekRec(),lg=w?LEAGUES[leagueOf(w.best)]:null;
  return`<button class="wcard cut" data-act="go:weekly"><span class="dh"><b>Вызов недели</b><span class="timer">${weekLeft()}</span></span><span class="wm">${MAPS[wc.mi].name}, ${wc.waves} волн</span><span class="chips">${dailyChips(wc)}</span><span class="wl">${lg?`<i class="lgm" style="--lc:${lg[2]}"></i>${lg[0]}, рекорд ${fmtN(w.best)}`:'Лиги и общая таблица рекордов'}</span></button>`}
export function questCard(){const Q=questState(),n=questReady();
  return`<button class="qcard" data-act="quests"><span class="dh"><b>Задания дня</b>${n?`<span class="qbadge">Забрать: ${n}</span>`:`<span class="timer"><span data-timer>${timeLeft()}</span></span>`}</span>
  <span class="qrows">${Q.list.map(q=>{const D=QIDX[q.id],f=Math.min(1,q.p/q.n);return`<span class="qr${q.c?' claimed':f>=1?' done':''}"><span>${D.t(q.n)}</span><i><b style="width:${Math.round(f*100)}%"></b></i></span>`}).join('')}</span></button>`}
