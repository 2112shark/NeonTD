// Lobby building blocks: elements, formatting, ranks, icons.
import { $ } from '../../core/util.ts';
import { PROG } from '../../meta/progress.ts';
import { ptsTotal } from '../../meta/lab.ts';
import { dayKey } from '../../meta/daily.ts';

/* ---------- lobby ---------- */
export const LOBBY=$('#lobby'),LBV=$('#lbView'),NAV=$('#lbNav'),SHEET=$('#sheet'),END=$('#end');
export const RM=typeof matchMedia==='function'&&matchMedia('(prefers-reduced-motion: reduce)').matches;
export const canVib=typeof navigator!=='undefined'&&'vibrate' in navigator;
/** short vibration on phones, if the player allows it */
export function vib(ms: number){if(canVib&&PROG.set&&PROG.set.vib)try{navigator.vibrate(ms)}catch(e){}}
export const lobbyOn=()=>!LOBBY.hidden;
export const MODE_RU: Record<RunState['mode'], string>={campaign:'кампания',endless:'бесконечный режим',daily:'вызов дня',weekly:'вызов недели'};
// tower names in the genitive and accusative case, for sentences
export const GEN: Record<TowerType, string>={laser:'лазера',cannon:'пушки',cryo:'крио',tesla:'теслы',sniper:'снайпера',gravi:'гравитона',gen:'генератора'};
export const ACC: Record<TowerType, string>={laser:'лазер',cannon:'пушку',cryo:'крио',tesla:'теслу',sniper:'снайпера',gravi:'гравитон',gen:'генератор'};
export const DIFFC=['#6dff9e','#ffc94d','#ff4d6d'];
export const STAR='M12 2.6l2.85 5.9 6.45.85-4.75 4.45 1.2 6.4L12 17.1l-5.75 3.1 1.2-6.4L2.7 9.35l6.45-.85z';
/** Russian plural form: f = [one, few, many] */
export function plural(n: number,f: [string, string, string]){n=Math.abs(n)%100;const d=n%10;return n>10&&n<20?f[2]:d>1&&d<5?f[1]:d===1?f[0]:f[2]}
export const cap=(s: string)=>s.charAt(0).toUpperCase()+s.slice(1);
export const fmtN=(n: number)=>Number(n).toLocaleString('ru-RU');
export function fmtTime(s: number){s=Math.floor(s);return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`}
export function weekLeft(){const n=new Date(),d=(8-n.getDay())%7||7,m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+d),s=Math.max(0,(+m-+n)/1000),dd=Math.floor(s/86400),hh=Math.floor(s%86400/3600);return dd?`ещё ${dd} ${plural(dd,['день','дня','дней'])}`:`ещё ${hh} ч`}
export function timeLeft(){const n=new Date(),m=new Date(n.getFullYear(),n.getMonth(),n.getDate()+1),s=Math.max(0,Math.floor((+m-+n)/1000));return[s/3600,s/60%60,s%60].map(v=>String(Math.floor(v)).padStart(2,'0')).join(':')}
export function dailyProg(key: string){return PROG.daily&&PROG.daily.key===key?PROG.daily:null}
export function streak(){const st=PROG.streak;if(!st)return 0;return st.last===dayKey()||st.last===dayKey(new Date(Date.now()-864e5))?st.n:0}
/** data cores needed, rank title */
const RANKS: [number, string][]=[[0,'Рекрут'],[4,'Оператор'],[10,'Дозорный'],[18,'Инженер'],[28,'Командор'],[40,'Архитектор рубежа'],[60,'Страж сети'],[85,'Легенда рубежа'],[120,'Хранитель ядра'],[160,'Неоновый маршал']];
export function rankInfo(){const xp=ptsTotal();let i=0;while(i+1<RANKS.length&&xp>=RANKS[i+1][0])i++;const next=RANKS[i+1]||null;return{i,name:RANKS[i][1],xp,next,prog:next?(xp-RANKS[i][0])/(next[0]-RANKS[i][0]):1}}
export function chevrons(n: number){let p='';for(let k=0;k<n;k++){const y=23-k*3.6;p+=`<path d="M3 ${y}L11 ${y-5.5}L19 ${y}"/>`}return`<svg viewBox="0 -3 22 30" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`}
const sv=(d: string)=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
/** inline SVG icons */
export const IC: Record<string, string>={
 back:sv('<path d="M15 5l-7 7 7 7"/>'),
 chev:'<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>',
 core:'<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.5 13.6 4.75v6.5L8 14.5 2.4 11.25v-6.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><circle cx="8" cy="8" r="2.2" fill="currentColor"/></svg>',
 sound:sv('<path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4.2 4.2 0 0 1 0 6M18 6.5a7.6 7.6 0 0 1 0 11"/>'),
 vib:sv('<rect x="8" y="3.5" width="8" height="17" rx="1.8"/><path d="M4.5 8v8M19.5 8v8"/>'),
 book:sv('<path d="M5 5.2A2.2 2.2 0 0 1 7.2 3H19v14.5H7.2A2.2 2.2 0 0 0 5 19.7z"/><path d="M5 19.7A1.3 1.3 0 0 0 6.3 21H19"/>'),
 help:sv('<circle cx="12" cy="12" r="9"/><path d="M9.6 9.4a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.5"/><path d="M12 16.8v.1"/>'),
 reset:sv('<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4.5v4h4"/>'),
 inf:sv('<path d="M8 8.5c-2 0-3.5 1.5-3.5 3.5s1.5 3.5 3.5 3.5c3 0 5-7 8-7 2 0 3.5 1.5 3.5 3.5s-1.5 3.5-3.5 3.5c-3 0-5-7-8-7z"/>'),
 lock:sv('<rect x="5.5" y="10.5" width="13" height="10" rx="2"/><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"/>'),
 starS:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg>`,
 vega:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 2.5 20.2 7.25v9.5L12 21.5 3.8 16.75v-9.5z"/><path d="M6.8 12h1.7l1.4-3 2.1 6 1.6-4.5 1 1.5h2.6"/></svg>',
 gem:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.5 4h9L20 9l-8 11L4 9z" fill="currentColor"/><path d="M4 9h16M9.5 4 12 9l2.5-5M12 9v11" fill="none" stroke="#05070f" stroke-width="1.1" stroke-linejoin="round" opacity=".45"/></svg>'
};
/* perk choice */
export const PIC: Record<string, string>={
 aim:sv('<circle cx="12" cy="12" r="7"/><path d="M12 2v5M12 17v5M2 12h5M17 12h5"/>'),
 fast:sv('<path d="M5 6l6 6-6 6M12 6l6 6-6 6"/>'),
 range:sv('<circle cx="12" cy="12" r="8.5" stroke-dasharray="3 2.6"/><path d="M12 12l6-6"/><circle cx="12" cy="12" r="1.6"/>'),
 tag:sv('<path d="M3.5 12.5V4.5h8l9 9-8 8z"/><circle cx="8" cy="9" r="1.5"/>'),
 coin:sv('<circle cx="12" cy="12" r="8.5"/><path d="M14.6 9.3A3 3 0 0 0 9.6 10c0 3 5 1.6 5 4.3a3 3 0 0 1-5 .9M12 6v12"/>'),
 wing:sv('<path d="M3 15c4-1 6-4 9-10 1 4 4 6 9 7-5 1-7 3-9 7-2-3-5-4-9-4z"/>'),
 hex:sv('<path d="M12 2.5 20.2 7.25v9.5L12 21.5 3.8 16.75v-9.5z"/><path d="M12 8v8M8 12h8"/>'),
 clock:sv('<circle cx="12" cy="12" r="8.5"/><path d="M12 7v5l3.5 2"/>'),
 burst:sv('<path d="M12 2l2 6 6-2-3.5 5.5L22 14l-6.5 1L17 21l-5-4-5 4 1.5-6L2 14l5.5-2.5L4 6l6 2z"/>'),
 bolt:sv('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
 snow:sv('<path d="M12 2v20M3.3 7l17.4 10M3.3 17 20.7 7M9 4l3 2 3-2M9 20l3-2 3 2"/>'),
};
