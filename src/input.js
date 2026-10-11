// Pointer and keyboard input on the battlefield.
import { cv, tile } from './render/canvas.js';
import { S } from './core/state.ts';
import { TYPES } from './data/towers.ts';
import { tcost, towerAt } from './core/stats.ts';
import { initAudio } from './audio/sfx.js';
import { toast } from './ui/comms.js';
import { castOrbital, enemyAt, forkTile, setFocus, startWave, toggleFork, useAbility } from './core/combat.ts';
import { build, buildBlock, canBuild, isDebris, sell, shown, upgrade } from './core/actions.ts';
import { takePerk } from './core/perks.ts';
import { closeRadial, openRadial, radKey, renderRadial, setRadKey } from './ui/radial.js';
import { updInfo } from './ui/info.js';
import { togglePause } from './ui/hud.js';
import { END, SHEET, lobbyOn } from './ui/lobby/shared.js';
import { LBY, SUB } from './ui/lobby/state.js';
import { go } from './ui/lobby/nav.js';
import { closeSheet, openSheet } from './ui/pauseSheet.js';

/* ---------- input ---------- */
/** @returns {Tile} */
function tileAt(ev){const r=cv.getBoundingClientRect();return[Math.floor((ev.clientX-r.left)/tile),Math.floor((ev.clientY-r.top)/tile)]}
cv.addEventListener('pointermove',ev=>{if(ev.pointerType==='mouse'){S.hover=tileAt(ev);if(S.place)updInfo()}});
cv.addEventListener('pointerleave',()=>{S.hover=null});
function worldAt(ev){const r=cv.getBoundingClientRect();return[(ev.clientX-r.left)/tile,(ev.clientY-r.top)/tile]}
cv.addEventListener('pointerdown',ev=>{
  initAudio();if(S.over||S.perkPick)return;const [c,r]=tileAt(ev);S.hover=[c,r];
  if(S.aim==='orbital'){castOrbital(c+.5,r+.5);return}
  const tw=towerAt(c,r);
  if(!S.place){const [wx,wy]=worldAt(ev),en=enemyAt(wx,wy);
    if(en){const free=tw||canBuild(c,r),dd=(en.x-wx)**2+(en.y-(en.air?.12:0)-wy)**2;if(!free||dd<.1){closeRadial();S.said.focusTip=1;setFocus(en);return}}
    const ft=forkTile();if(ft&&ft[0]===c&&ft[1]===r){closeRadial();S.said.fork=1;toggleFork();return}}
  if(S.place){
    if(tw){S.place=null;openRadial(c,r);return}
    if(canBuild(c,r)){const why=buildBlock(S.place);if(why){toast(why);S.place=null}else if(S.gold>=tcost(S.place)){build(S.place,c,r);if(S.gold<tcost(S.place))S.place=null}else toast('Не хватает кредитов')}
    else S.place=null;
    updInfo(true);return;
  }
  if(S.rad&&S.rad.c===c&&S.rad.r===r){closeRadial();return}
  if(tw||canBuild(c,r)||isDebris(c,r))openRadial(c,r);else closeRadial();
});
addEventListener('keydown',ev=>{
  const k=(ev.key||'').toLowerCase();
  if(lobbyOn()){if(k==='escape'&&SUB[LBY.scr])go(LBY.back||'home');return}
  if(!SHEET.hidden){if(k==='escape')closeSheet();return}
  if(!END.hidden||!S||S.over)return;
  if(S.perkPick){const i=+k-1;if(k>='1'&&k<='4'&&S.perkPick[i])takePerk(S.perkPick[i]);return}
  if(k>='1'&&k<='7'){initAudio();closeRadial();const ty=TYPES[+k-1];if(!ty||!shown(ty)||!S.allowed.includes(ty)){if(ty)toast(buildBlock(ty));return}S.place=S.place===ty?null:ty;updInfo(true)}
  else if(k==='escape'){if(S.place||S.rad||S.aim){S.place=null;closeRadial()}else openSheet()}
  else if(k===' '){ev.preventDefault();togglePause()}
  else if(k==='q'||k==='й')useAbility('orbital');
  else if(k==='w'||k==='ц')useAbility('emp');
  else if(k==='e'||k==='у')useAbility('shield');
  else if((k==='u'||k==='г')&&S.sel){if(S.sel.lvl<3&&upgrade(S.sel)){setRadKey('');renderRadial();updInfo(true)}}
  else if((k==='s'||k==='ы')&&S.sel){sell(S.sel);closeRadial()}
  else if((k==='t'||k==='е')&&S.sel){S.sel.mode=(S.sel.mode+1)%4;setRadKey('');renderRadial();updInfo(true)}
  else if(k==='n'||k==='т'){initAudio();startWave()}
});
