// Top HUD, ability buttons, speed and pause controls.
import { $ } from '../core/util.js';
import { S, setSpeed, speed } from '../core/state.js';
import { AB, abCd } from '../data/abilities.js';
import { maxW } from '../core/waves.js';
import { initAudio } from '../audio/sfx.js';
import { startWave, useAbility } from '../core/combat.js';
import { SHEET, fmtTime, lobbyOn } from './lobby/shared.js';
import { openSheet } from './pauseSheet.js';

/* ---------- HUD & abilities UI ---------- */
const hud={l:$('#hLives'),g:$('#hGold'),w:$('#hWave'),n:$('#bNext'),lk:$('#hLivesK'),wk:$('#hWaveK')};const hv={};
export function hudLabels(){if(!S)return;hud.lk.textContent=S.coreHp?'Ядра':'Ядро';hud.wk.textContent=S.flow?'Поток':'Волна';hv.l=hv.w=hv.n=null}
function setT(k,v){if(hv[k]!==v){hv[k]=v;hud[k].textContent=v}}
const abEls={};for(const k in AB)abEls[k]={b:$('#ab-'+k),cd:$('#ab-'+k+' .cd')};
export function updHud(){
  setT('l',S.coreHp?S.coreHp.join('·'):S.lives);setT('g',Math.floor(S.gold));setT('w',S.flow?fmtTime(Math.max(0,S.flowLeft)):`${S.wave}/${maxW()===Infinity?'∞':maxW()}`);
  let nt,dis=false;
  if(S.over){nt='Игра окончена';dis=true}
  else if(S.flow&&S.started){nt=`Поток · ${S.enemies.length+S.queue.length}`;dis=true}
  else if(S.waveActive){nt=`Врагов: ${S.enemies.length+S.queue.length}`;dis=true}
  else if(!S.started)nt='Старт ▶';
  else nt=`Волна ${S.wave+1} ▶ ${Math.ceil(S.countdown)} с`;
  setT('n',nt);hud.n.disabled=dis;
  for(const k in AB){const e=abEls[k],c=S.ab[k],p=c/abCd(k);e.b.style.setProperty('--p',p.toFixed(3));
    const txt=c>0?Math.ceil(c)+'с':(k==='shield'&&S.shieldT>0?Math.ceil(S.shieldT)+'с':'');if(e.cd.textContent!==txt)e.cd.textContent=txt;
    e.b.classList.toggle('ready',c<=0);e.b.classList.toggle('aim',S.aim===k||(k==='shield'&&S.shieldT>0))}
}
document.querySelector('.abil').addEventListener('click',e=>{const b=e.target.closest('.ab');if(b)useAbility(b.dataset.ab)});
$('#bNext').onclick=()=>{initAudio();startWave()};
$('#speed').onclick=e=>{const b=e.target.closest('button');if(!b)return;setSpeed(+b.dataset.s);document.querySelectorAll('#speed button').forEach(x=>x.classList.toggle('on',x===b))};
export function togglePause(){if(!S||S.over||lobbyOn()||!SHEET.hidden)return;S.paused=!S.paused;$('#pauseOv').hidden=!S.paused;$('#bPause').textContent=S.paused?'▶':'❚❚'}
$('#bPause').onclick=togglePause;
$('#bMenu').onclick=()=>{initAudio();openSheet()};
