// Pause menu.
import { $ } from '../core/util.ts';
import { PROG } from '../meta/progress.js';
import { saveProg } from '../meta/net.js';
import { S, newGame } from '../core/state.ts';
import { PK_ID } from '../data/perks.ts';
import { initAudio, muted, setMuted, snd } from '../audio/sfx.js';
import { say } from './comms.js';
import { starOk } from '../core/endgame.ts';
import { renderCoach } from './tutorial.js';
import { closeRadial } from './radial.js';
import { SHEET, STAR, lobbyOn } from './lobby/shared.js';
import { LBY, goalLong, runName, runProg, starConds } from './lobby/state.js';
import { openLobby } from './lobby/nav.js';

/* pause sheet */
export function openSheet(){if(!S||S.over||lobbyOn()||!SHEET.hidden)return;closeRadial();S.aim=null;S.place=null;S.paused=true;$('#pauseOv').hidden=true;LBY.arm=null;renderSheet();SHEET.hidden=false;renderCoach();snd('tap')}
export function closeSheet(){SHEET.hidden=true;S.paused=false;$('#bPause').textContent='❚❚';renderCoach()}
export function renderSheet(){
  $('#shSub').textContent=`${runName()}. ${runProg()}`;
  const mh=`<div><span>${S.coreHp?'Ядра':'Ядро'}</span><b>${S.coreHp?S.coreHp.join('·'):S.lives}</b></div><div><span>Кредиты</span><b>${Math.floor(S.gold)}</b></div><div><span>Уничтожено</span><b>${S.kills}</b></div>`;
  const mi=$('#shMinis');if(mi.innerHTML!==mh)mi.innerHTML=mh;
  let gh='';
  if(S.mis){const M=S.mis,c=starConds(M),ok=[1,starOk(M.s2),M.s3.k==='boss'&&S.bossT==null?null:starOk(M.s3)];
    gh=`<p>${goalLong(M,S.nm)}</p><ul class="stl mini">${c.map((t,k)=>`<li class="${k&&ok[k]?'got':''}${k&&ok[k]===false?' miss':''}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg><span>${t}</span></li>`).join('')}</ul>`}
  if(S.perks.length)gh+=`<div class="shp">${S.perks.map(id=>`<span class="chip" style="--cc:${PK_ID[id].col}">${PK_ID[id].name}: ${PK_ID[id].desc.toLowerCase()}</span>`).join('')}</div>`;
  const g=$('#shGoal');if(g.innerHTML!==gh)g.innerHTML=gh;g.hidden=!gh;
  const sb=$('#shSound');sb.textContent=muted?'Звук выключен':'Звук включён';sb.classList.toggle('off',muted);
  const rb=$('#shRestart');rb.textContent=LBY.arm==='restart'?'Точно заново?':'Начать заново';rb.classList.toggle('warnish',LBY.arm==='restart');
}
export function rerun(){const mode=S.mode,mi=S.mi,cfg=S.mis?{nm:S.nm}:null;newGame(mi,mode,cfg);S.paused=false;$('#bPause').textContent='❚❚';
  if(S.mis&&!S.tut)setTimeout(()=>{if(S&&!S.over&&!lobbyOn())say(S.mis.open)},500)}
SHEET.addEventListener('click',e=>{
  if(e.target===SHEET){closeSheet();return}
  const b=e.target.closest('button');if(!b)return;initAudio();
  if(b.id==='shResume')closeSheet();
  else if(b.id==='shSound'){setMuted(!muted);PROG.set.sound=!muted;saveProg();if(!muted)snd('tap');renderSheet()}
  else if(b.id==='shRestart'){if(LBY.arm!=='restart'){LBY.arm='restart';renderSheet();return}LBY.arm=null;SHEET.hidden=true;rerun();renderCoach()}
  else if(b.id==='shExit'){SHEET.hidden=true;openLobby('home')}
});
