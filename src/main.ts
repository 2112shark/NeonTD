// Entry point: wires modules together, starts the game loop.
import { $ } from './core/util.ts';
import { fit } from './render/canvas.ts';
import './meta/progress.ts';
import { netInit } from './meta/net.ts';
import { S, newGame, speed } from './core/state.ts';
import './meta/lab.ts';
import './meta/achievements.ts';
import './data/maps.ts';
import './data/towers.ts';
import './data/enemies.ts';
import './data/abilities.ts';
import './data/campaign.ts';
import './data/perks.ts';
import './data/quests.ts';
import './core/map.ts';
import './core/waves.ts';
import './meta/daily.ts';
import './meta/mastery.ts';
import './meta/season.ts';
import './meta/shop.ts';
import './meta/weekly.ts';
import './core/stats.ts';
import './audio/sfx.ts';
import './ui/comms.ts';
import { update } from './core/combat.ts';
import './core/endgame.ts';
import './core/actions.ts';
import './ui/perkChoice.ts';
import './core/perks.ts';
import './meta/quests.ts';
import './ui/tutorial.ts';
import './ui/towerCard.ts';
import { renderRadial } from './ui/radial.ts';
import './render/map.ts';
import './render/towers.ts';
import './render/enemies.ts';
import { draw } from './render/draw.ts';
import { updInfo } from './ui/info.ts';
import { updHud } from './ui/hud.ts';
import { SHEET, lobbyOn } from './ui/lobby/shared.ts';
import './ui/lobby/widgets.ts';
import './ui/lobby/state.ts';
import './ui/lobby/home.ts';
import './ui/lobby/campaign.ts';
import './ui/lobby/lab.ts';
import './ui/lobby/awards.ts';
import './ui/lobby/weekly.ts';
import './ui/lobby/more.ts';
import { openLobby } from './ui/lobby/nav.ts';
import { lbFrame } from './ui/lobby/background.ts';
import { renderSheet } from './ui/pauseSheet.ts';
import './ui/results.ts';
import './input.ts';
import './testHook.ts';

new ResizeObserver(fit).observe($('#stage'));
let last=performance.now(),acc=0;
function loop(now: number){
  const dt=Math.min(.05,(now-last)/1000);last=now;
  if(lobbyOn()){lbFrame(dt);requestAnimationFrame(loop);return}
  if(!S.paused&&!S.over&&!S.perkPick){const g=dt*speed,n=Math.ceil(g/(1/60)),h=g/n;for(let i=0;i<n;i++)update(h)}
  else if(S.over){for(const p of S.parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt}S.parts=S.parts.filter(p=>p.life>0)}
  draw();updHud();
  acc+=dt;if(acc>.2){acc=0;updInfo();if(S.rad)renderRadial();if(!SHEET.hidden)renderSheet()}
  requestAnimationFrame(loop);
}
newGame(0);fit();openLobby('home');requestAnimationFrame(loop);netInit();
