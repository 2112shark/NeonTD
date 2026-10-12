// Tower veterans, mastery, skins and kill effects.
import { PROG } from './progress.ts';
import { S } from '../core/state.ts';
import { fair, lab } from './lab.ts';
import { unlock } from './achievements.ts';
import { snd } from '../audio/sfx.ts';
import { burst, text } from '../core/combat.ts';
import { qev } from './quests.ts';

/* ---------- veterans, mastery, skins, kill effects ---------- */
// kills needed for veteran stars 1-3
const VET=[20,60,140];
/** damage bonus from veteran stars */
export const vetB=(t: TowerLike)=>[0,.05,.1,.15][t.vet||0];
export function vetUp(t: Tower){const k=VET.map(n=>Math.round(n*(lab('vet')?.7:1)));let v=0;while(v<3&&t.kills>=k[v])v++;
  if(v>(t.vet||0)){t.vet=v;text(t.x,t.y-.62,'Ветеран '+'★'.repeat(v),'#ffc94d',.3,1.5);burst(t.x,t.y,'#ffc94d',14,2,.6,.07);snd('vet');qev('vet',1);if(v>=3)unlock('veteran')}}
// mastery XP needed for each level
export const MAST=[0,50,150,300,500,800,1200,1700,2300,3000];
/** mastery XP of a tower type: kills, or credits produced for the generator */
export function mastXP(type: TowerType): number{const st=PROG.st;return type==='gen'?Math.floor((st.gi||0)/8):((st.kl||{})[type]||0)}
export function mastLv(type: TowerType){const x=mastXP(type);let l=1;while(l<MAST.length&&x>=MAST[l])l++;return l}
/** damage bonus from mastery: 1% per level above 1 */
export const mastB=(type: TowerType)=>fair()?0:.01*(mastLv(type)-1);
/** tower skin: colors, `m` = mastery level that unlocks it, `holo` = animated hue */
export interface Skin { name: string; c?: string; sc?: string; m?: number; holo?: 1 }
export const SKINS: Record<string, Skin>={
 base:{name:'Стандарт'},
 chrome:{name:'Хром',c:'#d6e0ff',sc:'#ffffff',m:3},
 gold:{name:'Золото',c:'#ffcf4d',sc:'#fff1bf',m:6},
 holo:{name:'Голограмма',holo:1,m:9},
 volt:{name:'Вольт',c:'#ffe14d',sc:'#ffffff'},
 ember:{name:'Уголь',c:'#ff6a2e',sc:'#ffd0a8'},
 neon:{name:'Неон',c:'#3df0ff',sc:'#ff4fd8'},
 frost:{name:'Иней',c:'#bff4ff',sc:'#ffffff'},
 aurora:{name:'Аврора',c:'#5cffb0',sc:'#c8a8ff'},
 void:{name:'Пустота',c:'#8a5cff',sc:'#e3d6ff'},
 toxic:{name:'Токсин',c:'#a6ff3d',sc:'#eaffc8'},
 rose:{name:'Роза',c:'#ff7ab8',sc:'#ffe0ef'},
 eclipse:{name:'Затмение',c:'#ff3d5c',sc:'#ffd23d'},
 plasma:{name:'Плазма',c:'#ff3df2',sc:'#fff0fd'},
 royal:{name:'Корона',c:'#a98bff',sc:'#ffd84d'},
};
function hsl2hex(h: number,s: number,l: number){const k=(n: number)=>(n+h/30)%12,a=s*Math.min(l,1-l),f=(n: number)=>l-a*Math.max(-1,Math.min(k(n)-3,9-k(n),1));return'#'+[f(0),f(8),f(4)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('')}
/** [body, accent] colors of a tower's skin at this time, or null for the default look */
export function skinCols(t: { skin?: string|null; x?: number; y?: number },time: number): [string, string]|null{const sk=t.skin&&t.skin!=='base'&&SKINS[t.skin];if(!sk)return null;
  if(sk.holo){const h=((time*70+(t.x||0)*37+(t.y||0)*23)%360+360)%360;return[hsl2hex(h,1,.66),hsl2hex((h+140)%360,1,.82)]}return[sk.c!,sk.sc!]}
export function skinOwned(type: TowerType,id: string){if(id==='base')return true;const sk=SKINS[id];if(!sk)return false;if(sk.m)return mastLv(type)>=sk.m;return!!(PROG.own&&PROG.own[id])}
export const skinFor=(type: TowerType)=>{const id=(PROG.skin||{})[type];return id&&skinOwned(type,id)?id:'base'};
/** kill effects */
export const KFX: Record<string, { name: string }>={none:{name:'Обычный'},spark:{name:'Искры'},pixel:{name:'Пиксели'},nova:{name:'Сверхновая'},confetti:{name:'Конфетти'},ice:{name:'Иней'},glitch:{name:'Глитч'}};
export function killFx(e: Enemy){const k=PROG.kfx||'none',x=e.x,y=e.y,b=e.d.boss;
  if(k==='spark'){burst(x,y,'#fff3b0',b?40:10,3.2,.45,.05);burst(x,y,e.d.col,b?20:6,2,.5,.07)}
  else if(k==='pixel'){const P=['#ff4fd8','#3df0ff','#ffe14d','#6dff9e'];for(let i=0;i<(b?24:8);i++)burst(x,y,P[i%4],1,2.4,.7,.14)}
  else if(k==='nova'){burst(x,y,e.d.col,b?40:10,2.4,.55,.07);S.fx.push({k:'ring',x,y,r:e.d.r*4,life:.45,max:.45,col:'#ffffff'})}
  else if(k==='confetti'){const P=['#ff4fd8','#3df0ff','#ffe14d','#6dff9e','#ff8a3d'];for(let i=0;i<(b?40:12);i++){if(S.parts.length>700)break;const a=-Math.PI/2+(Math.random()-.5)*2.2,v=2+Math.random()*2.5;S.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:7,life:.9,max:.9,col:P[i%5],size:.08})}}
  else if(k==='ice'){burst(x,y,'#dff8ff',b?40:12,2.6,.6,.08);burst(x,y,'#7fe4ff',b?20:6,1.4,.8,.1)}
  else if(k==='glitch'){S.fx.push({k:'glitch',x,y,r:e.d.r*2.2,life:.3,max:.3,col:e.d.col,seed:Math.random()*1e5});burst(x,y,e.d.col,b?30:8,2.2,.5,.07)}
  else burst(x,y,e.d.col,b?60:14,b?4:2.4,b?1:.55,b?.12:.07);
}
