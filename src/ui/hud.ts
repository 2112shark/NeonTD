// Top HUD, ability buttons, speed and pause controls.
import { $ } from '../core/util.ts';
import { S, setSpeed, speed } from '../core/state.ts';
import { PROG } from '../meta/progress.ts';
import { saveProg } from '../meta/net.ts';
import { AB, abCd } from '../data/abilities.ts';
import { maxW } from '../core/waves.ts';
import { initAudio } from '../audio/sfx.ts';
import { startWave, useAbility } from '../core/combat.ts';
import { SHEET, fmtTime, lobbyOn } from './lobby/shared.ts';
import { openSheet } from './pauseSheet.ts';

/* ---------- HUD & abilities UI ---------- */
const hud={l:$('#hLives'),g:$('#hGold'),w:$('#hWave'),n:$<HTMLButtonElement>('#bNext'),lk:$('#hLivesK'),wk:$('#hWaveK')};
type HudKey = 'l' | 'g' | 'w' | 'n';
// last values written, so the DOM is only touched on change
const hv: Partial<Record<HudKey, string | number | null>>={};
export function hudLabels(){if(!S)return;hud.lk.textContent=S.coreHp?'Ядра':'Ядро';hud.wk.textContent=S.flow?'Поток':'Волна';hv.l=hv.w=hv.n=null}
function setT(k: HudKey,v: string|number){if(hv[k]!==v){hv[k]=v;hud[k].textContent=String(v)}}
const abEls={} as Record<AbilityId, { b: HTMLElement; cd: HTMLElement }>;for(const k of Object.keys(AB) as AbilityId[])abEls[k]={b:$('#ab-'+k),cd:$('#ab-'+k+' .cd')};
export function updHud(){
  setT('l',S.coreHp?S.coreHp.join('·'):S.lives);setT('g',Math.floor(S.gold));setT('w',S.flow?fmtTime(Math.max(0,S.flowLeft)):`${S.wave}/${maxW()===Infinity?'∞':maxW()}`);
  let nt: string,dis=false;
  if(S.over){nt='Игра окончена';dis=true}
  else if(S.flow&&S.started){nt=`Поток · ${S.enemies.length+S.queue.length}`;dis=true}
  else if(S.waveActive){nt=`Врагов: ${S.enemies.length+S.queue.length}`;dis=true}
  else if(!S.started)nt='Старт ▶';
  else nt=`Волна ${S.wave+1} ▶ ${Math.ceil(S.countdown)} с`;
  setT('n',nt);hud.n.disabled=dis;
  for(const k of Object.keys(AB) as AbilityId[]){const e=abEls[k],c=S.ab[k],p=c/abCd(k);e.b.style.setProperty('--p',p.toFixed(3));
    const txt=c>0?Math.ceil(c)+'с':(k==='shield'&&S.shieldT>0?Math.ceil(S.shieldT)+'с':'');if(e.cd.textContent!==txt)e.cd.textContent=txt;
    e.b.classList.toggle('ready',c<=0);e.b.classList.toggle('aim',S.aim===k||(k==='shield'&&S.shieldT>0))}
}
$('.abil').addEventListener('click',e=>{const b=(e.target as HTMLElement).closest<HTMLElement>('.ab');if(b)useAbility(b.dataset.ab as AbilityId)});
$('#bNext').onclick=()=>{initAudio();startWave()};
// one button cycles the game speed; the choice is remembered with the settings
export const SPEEDS=[1,2,3,5,7];
const spdBtn=$<HTMLButtonElement>('#speed');
function showSpeed(){spdBtn.textContent='×'+speed;spdBtn.setAttribute('aria-label','Скорость игры: ×'+speed)}
export function cycleSpeed(){const i=SPEEDS.indexOf(speed);setSpeed(SPEEDS[(i+1)%SPEEDS.length]);PROG.set.speed=speed;saveProg();showSpeed()}
/** restore the remembered speed; called from main once every module is loaded (core/state initializes after this module) */
export function initSpeed(){if(SPEEDS.includes(PROG.set.speed))setSpeed(PROG.set.speed);showSpeed()}
spdBtn.onclick=cycleSpeed;
export function togglePause(){if(!S||S.over||lobbyOn()||!SHEET.hidden)return;S.paused=!S.paused;$('#pauseOv').hidden=!S.paused;$('#bPause').textContent=S.paused?'▶':'❚❚'}
$('#bPause').onclick=togglePause;
$('#bMenu').onclick=()=>{initAudio();openSheet()};
