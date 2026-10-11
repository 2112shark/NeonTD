// Season track: XP, tiers, rewards.
import { PROG } from './progress.js';
import { S } from '../core/state.js';
import { unlock } from './achievements.js';
import { KFX, SKINS } from './mastery.js';
import { toast } from '../ui/comms.js';
import { lobbyOn } from '../ui/lobby/shared.js';

/* ---------- season track ---------- */
const SEASONS=[
 {name:'Перегрузка',col:'#ffe14d',mod:'fast',skins:['volt','ember','neon'],fx:['spark','pixel','nova'],titles:['Разрядник','Под напряжением','Повелитель тока']},
 {name:'Ледниковый период',col:'#7fe4ff',mod:'armor',skins:['frost','aurora','void'],fx:['ice','confetti','glitch'],titles:['Ледокол','Холодный расчёт','Вечная мерзлота']},
 {name:'Рой',col:'#4dffd2',mod:'swarm',skins:['toxic','rose','neon'],fx:['confetti','spark','pixel'],titles:['Дезинсектор','Страж улья','Гроза роя']},
 {name:'Затмение',col:'#ff4d6d',mod:'cloak',skins:['eclipse','void','ember'],fx:['glitch','nova','ice'],titles:['Ночной дозор','Тень рубежа','Властелин затмения']},
];
export const S_TIER=750,S_MAX=30,S_EARLY=5,S_EARLY_COST=350,S_OLD=250,XP_WAVE=4,XP_DAILY=150;
export const tierStart=t=>t<=S_EARLY?t*S_EARLY_COST:S_EARLY*S_EARLY_COST+(t-S_EARLY)*S_TIER;
export const tierCost=t=>t<=S_EARLY?S_EARLY_COST:S_TIER;
export function tierOf(xp){let t=0;while(t<S_MAX&&xp>=tierStart(t+1))t++;return t}
// a season started under the old flat 250-XP tiers keeps its tier and the progress inside it
export function seasonMigrate(s){if(!s||s.e2)return s;const old=Math.min(S_MAX,(s.xp||0)/S_OLD),t=Math.floor(old);
  s.xp=t>=S_MAX?tierStart(S_MAX):Math.round(tierStart(t)+(old-t)*tierCost(t+1));s.e2=1;return s}
export function seasonInfo(d){d=d||new Date();const e=new Date(2026,9,5),t=new Date(d.getFullYear(),d.getMonth(),d.getDate()),days=Math.round((t-e)/864e5),idx=Math.max(0,Math.floor(days/28));
  return{idx,num:idx+1,def:SEASONS[idx%SEASONS.length],start:new Date(2026,9,5+idx*28),end:new Date(2026,9,5+idx*28+28)}}
export function tierRew(def,t){if(t%10===0)return{k:'skin',id:def.skins[t/10-1]};if(t%10===5)return{k:'fx',id:def.fx[(t-5)/10]};if(t%10===7)return{k:'title',id:def.titles[(t-7)/10]};return{k:'core',n:1}}
export function seasonState(){const si=seasonInfo();let s=PROG.season;if(!s||s.id!==si.num){s={id:si.num,xp:0,got:0,e2:1};PROG.season=s}else seasonMigrate(s);return s}
export const seasonTier=()=>tierOf(seasonState().xp);
export function addXP(n){if(!n)return;const s=seasonState(),def=seasonInfo().def,before=seasonTier();s.xp+=Math.round(n);const after=seasonTier();
  if(S)S.xpGain=(S.xpGain||0)+Math.round(n);
  for(let t=before+1;t<=after;t++)if(t>(s.got||0))grantTier(def,t)}
// a season reward the player already bought in the shop returns its price; any other duplicate gives a little data
export function dupRew(key,n){const p=(PROG.buy||{})[key],rf=PROG.refund||(PROG.refund={});
  if(p&&!rf[key]){rf[key]=p;return`. Ядра за покупку возвращены: +${p}`}PROG.bonus=(PROG.bonus||0)+n;return''}
export function grantTier(def,t){const r=tierRew(def,t),own=PROG.own||(PROG.own={});let note='';
  if(r.k==='core')PROG.bonus=(PROG.bonus||0)+1;
  else if(r.k==='skin'){if(own[r.id])note=dupRew(r.id,2);own[r.id]=1}
  else if(r.k==='fx'){if(own['fx:'+r.id])note=dupRew('fx:'+r.id,1);own['fx:'+r.id]=1}
  else own['t:'+r.id]=1;
  const s=PROG.season;s.got=Math.max(s.got||0,t);if(t>=10)unlock('season10');
  if(S&&S.newTiers)S.newTiers.push(t);
  if(S&&!lobbyOn()&&!S.over)toast(`Сезон: ступень ${t}. ${rewName(r)}${note}`)}
export function rewName(r){return r.k==='core'?'+1 ядро данных':r.k==='skin'?`Облик «${SKINS[r.id].name}»`:r.k==='fx'?`Эффект «${KFX[r.id].name}»`:`Титул «${r.id}»`}
