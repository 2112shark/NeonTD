// Battle simulation: waves, spawning, movement, targeting, damage, abilities, the per-frame update.
import { COLS, ROWS, d2 } from './util.ts';
import { PROG } from '../meta/progress.ts';
import { saveProg } from '../meta/net.ts';
import { S } from './state.ts';
import { lab } from '../meta/lab.ts';
import { unlock } from '../meta/achievements.ts';
import { TD, type Stats } from '../data/towers.ts';
import { BOSS_LAP, BOSS_LAP_HEAL, CLOAK_NEAR, ED, MODS } from '../data/enemies.ts';
import { AB, abCd } from '../data/abilities.ts';
import { BL, ELINE } from '../data/campaign.ts';
import { genWave, hpMul, maxW, waveMods } from './waves.ts';
import { killFx, vetUp } from '../meta/mastery.ts';
import { XP_WAVE, addXP } from '../meta/season.ts';
import { hasP, stats } from './stats.ts';
import { initAudio, snd } from '../audio/sfx.ts';
import { say, toast } from '../ui/comms.ts';
import { endGame } from './endgame.ts';
import { offerPerks } from './perks.ts';
import { qev } from '../meta/quests.ts';
import { endTut, tutEvent } from '../ui/tutorial.ts';
import { closeRadial } from '../ui/radial.ts';
import { buildBg } from '../render/map.ts';
import { updInfo } from '../ui/info.ts';
import { SHEET, lobbyOn, vib } from '../ui/lobby/shared.ts';

export function startWave(){
  if(S.over||S.perkPick)return;
  if(S.flow){if(S.started&&S.flowLeft<=0)return}
  else if(S.waveActive||S.wave>=maxW())return;
  const msg: string[]=[];
  if(S.wave>0&&!S.flow){const bank=hasP('bank'),rate=bank?.08:lab('int')?.06:.05,cap=(lab('int')?60:40)+(bank?30:0)+(S.towers.some(t=>t.type==='gen'&&t.br==='A')?20:0),it=Math.min(cap,Math.floor(S.gold*rate));
    if(it>0){S.gold+=it;msg.push(`проценты +${it}`);qev('int',it)}if(it>=cap)unlock('interest');
    const eb=Math.floor(S.countdown*2);if(eb>0){S.gold+=eb;msg.push(`досрочно +${eb}`);S.early++;if(S.early>=5)unlock('early')}}
  S.wave++;S.started=true;const q=genWave(S.wave);S.curMods=waveMods(S.wave);if(S.curMods.includes('cloak')&&!S.said.cloak){S.said.cloak=1;setTimeout(()=>say('Невидимки! Крио и Тесла видят их во всей зоне действия, остальные башни только вплотную, на полторы клетки. Поставьте Крио у пути.'),400)}
  if(S.flow){if(!S.queue.length)S.spawnT=q[0].d;S.queue.push(...q);S.flowNext=10;if(S.wave>1)genIncome(.4)}
  else{S.queue=q;S.spawnT=q[0].d}
  S.waveActive=true;S.countdown=0;
  if(!S.flow||S.wave===1)toast((S.flow?'Поток пошёл':`Волна ${S.wave}`)+S.curMods.map(k=>' · '+MODS[k].name).join('')+(msg.length?' · '+msg.join(' · '):''));
  snd(q.some(o=>ED[o.t].boss)?'boss':'wave');updInfo(true);tutEvent('wave');
  if(S.mis&&!S.flow&&S.wave===S.mis.waves&&S.wave>1)say(S.mis.boss?'Последняя волна, и с ней босс. Держитесь!':'Последняя волна. Держитесь!');
}
/** create an enemy at the gate of its lane, or next to `from` (its parent) */
export function spawn(t: EnemyType,from?: Enemy|null,lane?: number){
  const d=ED[t],m=S.map,mods=S.curMods,has=(k: ModId)=>mods.includes(k);let mul=hpMul(Math.max(1,S.wave));if(has('swarm'))mul*=.65;
  const air=!!d.air,rt=from&&from.rt?from.rt:m.fork!=null?m.routes[S.sw]:(m.routes[lane||0]||m.routes[0]);
  const path=air?rt.air:rt.path,sh=(d.shield||0)*mul*.6,ab=d.heal||d.jam||d.blink||d.brood||d.gun;
  const e: Enemy={t,d,hp:d.hp*mul,max:d.hp*mul,sh,msh:sh,spd:d.spd*(has('fast')?1.2:1),armor:(d.armor||0)+(has('armor')&&!d.boss?3:0),air,rt,path,i:0,x:path[0].x,y:path[0].y,prog:0,len:air?rt.airLen:rt.len,
    rw:Math.round(d.rw*(1+(S.wave-1)*.03)*(1+.2*mods.length)),slowT:0,slow:0,stun:0,frz:0,brit:0,shT:0,hitT:0,ang:0,wob:Math.random()*6,dead:false,
    regen:has('regen')?(d.boss?.004:.02):0,cloak:has('cloak'),vis:!has('cloak'),born:S.time,cd:ab?ab.cd*(.5+Math.random()*.5):0,phase:0,gnd:0,wellT:0,wellP:0,dragD:0};
  if(from)attach(e,from);
  else{const p=path[1];e.ang=Math.atan2(p.y-e.y,p.x-e.x)}
  S.enemies.push(e);seeEnemy(e);return e;
}
// place a spawned enemy where its parent is; ground parents hand flyers over to the next corner of the air route
function attach(e: Enemy,from: Enemy){
  e.x=from.x;e.y=from.y;e.ang=from.ang;e.forked=from.forked;
  if(e.air&&!from.air){const k=Math.min(e.path.length-1,Math.floor(from.i/2)+1);e.i=k-1;e.prog=from.prog/from.len*e.len}
  else{e.i=Math.min(from.i,e.path.length-2);e.prog=from.prog}
}
function seeEnemy(e: Enemy){
  const t=e.t;if(S.said['e:'+t])return;S.said['e:'+t]=1;
  if(e.d.boss){say(BL[t]!.spawn);return}
  const line=ELINE[t];if(!line)return;const seen=PROG.seenE||(PROG.seenE={});
  if((S.mis&&S.mis.newE===t)||!seen[t])say(line);seen[t]=1;
}
/** particle burst */
export function burst(x: number,y: number,col: string,n: number,sp=2.2,life=.55,size=.07){
  if(S.parts.length>700)return;
  for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=sp*(.3+Math.random());S.parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:life*(.6+Math.random()*.6),max:life,col,size:size*(.6+Math.random()*.8)})}
}
export function text(x: number,y: number,s: string,col: string,size=.3,life=.9){S.texts.push({x,y,s,col,size,life,max:life})}
/** damage after brittleness, perks, focus, armor and shield; src is the tower for stats and veterancy */
function hurt(e: Enemy,dmg: number,pierce: boolean,src: Tower|null){
  if(e.dead)return;
  if(e.brit>0&&e.slowT>0)dmg*=1+e.brit;
  if(e.air&&hasP('air'))dmg*=1.25;
  if(e.d.boss&&hasP('boss'))dmg*=1.25;
  if(S.focus&&S.focus.e===e&&lab('foc'))dmg*=1.15;
  if(!pierce&&e.armor)dmg*=1-Math.min(.7,e.armor*(hasP('armor')?.02:.04));
  if(e.sh>0){const a=Math.min(e.sh,dmg);e.sh-=a;dmg-=a;e.shT=2.2}
  e.hp-=dmg;e.hitT=.07;
  if(src&&src.type){src.dmg=(src.dmg||0)+dmg;const sd=PROG.st.dmg||(PROG.st.dmg={});sd[src.type]=(sd[src.type]||0)+dmg}
  if(e.hp<=0)kill(e,src);
}
function kill(e: Enemy,src: Tower|null){
  e.dead=true;const rw=e.rw+(hasP('bounty')?2:0);S.gold+=rw;S.kills++;PROG.kills++;if(src&&src.type){src.kills++;if(src.type!=='gen')vetUp(src)}
  const st=PROG.st;st.ek=st.ek||{};st.ek[e.t]=(st.ek[e.t]||0)+1;if(src&&src.type){st.kl=st.kl||{};st.kl[src.type]=(st.kl[src.type]||0)+1}
  qev('kill',1,e);
  unlock('first');if(PROG.kills>=1000)unlock('kills');if(st.ek.medic>=50)unlock('medic');
  killFx(e);
  S.fx.push({k:'pop',x:e.x,y:e.y,r:e.d.r*2.4,life:.3,max:.3,col:e.d.col});
  text(e.x,e.y-.2,'+'+rw,'#ffc94d',rw>=20?.4:.26);
  if(e.d.splits){for(let k=0;k<2;k++){const s=spawn(e.d.splits,e);s.stun=k*.35;s.x+=(Math.random()-.5)*.2;s.y+=(Math.random()-.5)*.2}}
  if(e.d.spawns){for(let k=0;k<e.d.spawns.n;k++){const s=spawn(e.d.spawns.t,e);s.stun=k*.25;s.x+=(Math.random()-.5)*.35;s.y+=(Math.random()-.5)*.35}}
  if(hasP('chainx')&&!e.d.boss){const dmg=e.max*.2;S.fx.push({k:'boom',x:e.x,y:e.y,r:.9,life:.3,max:.3,col:'#ff8a3d'});
    for(const f of S.enemies.slice())if(!f.dead&&f!==e&&d2(f,e)<=.81)hurt(f,dmg,true,null)}
  if(e.d.boss){snd('boom');S.shake=.5;unlock(e.t);S.bossT=S.time-e.born;if(S.bossT<=20)unlock('bossfast');qev('boss',1,e);
    if(S.focus&&S.focus.e===e)unlock('focus');const b=PROG.st.boss||(PROG.st.boss={});b[e.t]=(b[e.t]||0)+1}
  else snd('kill');
  if(S.focus&&S.focus.e===e)S.focus=null;
}
/** move along the path; reaching the end hurts the core */
function moveE(e: Enemy,dist: number){
  let rem=dist;const m=S.map;
  while(rem>0&&e.i<e.path.length-1){
    const tg=e.path[e.i+1],dx=tg.x-e.x,dy=tg.y-e.y,L=Math.hypot(dx,dy);
    if(L<1e-6){e.i++;continue}
    const ta=Math.atan2(dy,dx);const da=((ta-e.ang+Math.PI*3)%(Math.PI*2))-Math.PI;e.ang+=da*.25;
    if(L<=rem){e.x=tg.x;e.y=tg.y;e.i++;rem-=L;e.prog+=L;
      if(m.fork!=null&&!e.air&&e.i===m.fork){const rt=m.routes[S.sw];if(rt!==e.rt){e.rt=rt;e.path=rt.path;e.len=rt.len}}}
    else{e.x+=dx/L*rem;e.y+=dy/L*rem;e.prog+=rem;rem=0}
  }
  if(e.i>=e.path.length-1&&!e.dead){
    e.dead=true;const dmg=e.d.boss?5:1,cy=Math.min(e.y,ROWS-.6);
    if(S.shieldT>0&&!(S.mis&&S.mis.boss===e.t)){S.shieldBlocks++;text(e.x,cy,'Щит!','#6dff9e',.34,1);burst(e.x,cy,'#6dff9e',16,2.5,.5,.07);snd('block');if(S.shieldBlocks>=3)unlock('shield');return}
    if(hasP('guard')&&S.guardW!==S.wave&&!(S.mis&&S.mis.boss===e.t)){S.guardW=S.wave;text(e.x,cy,'Аварийный щит','#6dff9e',.3,1.2);burst(e.x,cy,'#6dff9e',12,2.2,.5,.07);snd('block');return}
    if(S.mis&&S.mis.boss===e.t&&!S.nm&&!S.bossLaps){const bc=e.rt.core||0;
      if((S.coreHp?S.coreHp[bc]:S.lives)>BOSS_LAP){S.bossLaps=1;S.lives-=BOSS_LAP;S.lost+=BOSS_LAP;S.leakGround+=BOSS_LAP;if(S.coreHp)S.coreHp[bc]-=BOSS_LAP;
        S.flash=.6;S.shake=.5;snd('leak');vib(140);text(e.x,cy,'−'+BOSS_LAP+' ядро','#ff4d6d',.38,1.3);say(BL[e.t]!.lap);
        e.dead=false;e.i=0;e.prog=0;e.x=e.path[0].x;e.y=e.path[0].y;e.hp=Math.min(e.max,e.hp+e.max*BOSS_LAP_HEAL);
        text(e.x,e.y-.6,'+'+Math.round(BOSS_LAP_HEAL*100)+'% здоровья','#ffb3c0',.32,1.4);return}}
    if(S.mis&&S.mis.boss===e.t){S.bossLeak=1;S.lives=Math.max(0,S.lives-dmg);S.lost+=dmg;S.flash=.6;S.shake=.5;snd('leak');vib(140);say(S.bossLaps?'Босс прорвался второй раз. Миссия провалена.':'Босс прорвался к ядру. Миссия провалена.');endGame(false);return}
    const ci=e.rt.core||0;if(S.coreHp)S.coreHp[ci]=Math.max(0,S.coreHp[ci]-dmg);
    if(e.air)S.leakAir+=dmg;else S.leakGround+=dmg;
    S.lives=Math.max(0,S.lives-dmg);S.lost+=dmg;S.flash=.4;S.shake=.25;snd('leak');vib(dmg>1?90:35);
    text(e.x,cy,'−'+dmg+' ядро','#ff4d6d',.34,1.1);
    if(S.lives<=0||(S.coreHp&&S.coreHp[ci]<=0))endGame(false);
    else if(!S.said.low&&(S.coreHp?S.coreHp[ci]/S.coreMax:S.lives/S.maxLives)<.3){S.said.low=1;say('Прочность ядра на исходе! Щит ядра спасёт от следующих прорывов.')}
  }
}
function moveBack(e: Enemy,dist: number){let rem=dist;
  while(rem>0){const tg=e.path[e.i],dx=tg.x-e.x,dy=tg.y-e.y,L=Math.hypot(dx,dy);
    if(L<1e-6){if(e.i===0)break;e.i--;continue}
    if(L<=rem){e.x=tg.x;e.y=tg.y;rem-=L;e.prog=Math.max(0,e.prog-L);if(e.i===0)break;e.i--}
    else{e.x+=dx/L*rem;e.y+=dy/L*rem;e.prog=Math.max(0,e.prog-rem);rem=0}}}
/** generators pay out: k is the share of a full wave's income */
export function genIncome(k: number){let n=0;for(const t of S.towers){if(t.type!=='gen'||t.off>0||t.jam>0)continue;const v=Math.round(stats(t).inc*k);if(v<=0)continue;S.gold+=v;n+=v;t.made=(t.made||0)+v;text(t.x,t.y-.4,'+'+v,'#ffd84d',.3,1.1)}
  if(n){PROG.st.gi=(PROG.st.gi||0)+n;S.gens+=n;snd('coin')}return n}
export const debCost=()=>40+25*S.cleared;
/** clear debris from a tile */
export function doClear(c: number,r: number){const cost=debCost();if(S.gold<cost){toast('Не хватает кредитов');return false}
  S.gold-=cost;S.grid[r][c]=0;S.cleared++;PROG.st.clear=(PROG.st.clear||0)+1;if(PROG.st.clear>=10)unlock('clear');qev('clear',1);
  burst(c+.5,r+.5,'#c9b18a',22,2.4,.7,.09);S.fx.push({k:'boom',x:c+.5,y:r+.5,r:.6,life:.4,max:.4,col:'#ffb040'});snd('boom');buildBg();return true}
/** targeting priority by tower mode: first, last, strongest, closest */
function valFor(t: Tower,e: Enemy){const m=t.mode;return m===0?e.prog/e.len:m===1?-e.prog/e.len:m===2?e.hp+e.sh:-d2(e,t)}
const isAir=(e: Enemy)=>e.air&&!(e.gnd>0);
function targets(t: Tower,s: Stats,air: boolean,needVis: boolean){
  const r2=s.range*s.range,L: Enemy[]=[];
  for(const e of S.enemies){if(e.dead||(isAir(e)&&!air)||(needVis&&!e.vis))continue;if(e.x<-.2||e.y<-.2||e.x>COLS+.2||e.y>ROWS+.2)continue;if(d2(e,t)<=r2)L.push(e)}
  return L;
}
function sorted(t: Tower,L: Enemy[]){L.sort((a,b)=>valFor(t,b)-valFor(t,a));const f=S.focus&&S.focus.e;if(f){const i=L.indexOf(f);if(i>0){L.splice(i,1);L.unshift(f)}}return L}
function aim(t: Tower,e: Point,dt: number){const a=Math.atan2(e.y-t.y,e.x-t.x);const da=((a-t.ang+Math.PI*3)%(Math.PI*2))-Math.PI;t.ang+=da*Math.min(1,dt*14)}
function updTower(t: Tower,dt: number){
  const d=TD[t.type];t.rc=Math.max(0,t.rc-dt*4);
  if(t.off>0||t.jam>0){t.off=Math.max(0,(t.off||0)-dt);t.jam=Math.max(0,(t.jam||0)-dt);t.beams=[];t.fm=1;return}
  const s=stats(t);t.cd=Math.max(0,t.cd-dt);
  if(t.type==='laser'){
    const L=targets(t,s,true,true),tg=sorted(t,L).slice(0,s.beams||1);
    if(s.focus){if(tg[0]&&tg[0]===t.last)t.fm=Math.min(3,t.fm+dt*.7);else t.fm=1;t.last=tg[0]}else t.fm=1;
    t.beams=tg;for(const e of tg)hurt(e,s.dps*dt*t.fm,false,t);
    if(tg[0])aim(t,tg[0],dt);
    if(tg.length&&Math.random()<dt*20){const e=tg[0];burst(e.x,e.y,d.col,1,1.4,.3,.05)}
    return;
  }
  if(t.type==='gen'){t.ang+=dt*.6;return}
  if(t.type==='cryo')t.ang+=dt*.8;
  if(t.cd>0)return;
  if(t.type==='gravi'){const L=targets(t,s,true,true);if(!L.length)return;const e=sorted(t,L)[0];
    S.wells.push({x:e.x,y:e.y-(isAir(e)?.12:0),r:s.wr,t:s.dur,max:s.dur,pull:s.pull,dps:s.dps,drag:s.drag||0,boom:s.boom||0,src:t,kind:t.br||''});
    aim(t,e,1);t.cd=s.rate;snd('grav');return}
  const seeAll=t.type==='cryo'||t.type==='tesla';
  const L=targets(t,s,!!d.air,!seeAll);if(!L.length)return;
  if(t.type==='cannon'){
    const tg=sorted(t,L).slice(0,s.shells||1);
    tg.forEach((e,i)=>{const lead=e.spd*(1-(e.slowT>0?e.slow:0))*.3,tx=e.x+Math.cos(e.ang)*lead,ty=e.y+Math.sin(e.ang)*lead;
      const dist=Math.hypot(tx-t.x,ty-t.y);S.proj.push({x:t.x,y:t.y,sx:t.x,sy:t.y,tx,ty,p:0,dur:Math.max(.28,dist/(s.range>3?5:6.5)),dmg:s.dmg,sp:s.splash,src:t,h:s.range>3?1.1:.45,delay:i*.08})});
    aim(t,tg[0],1);t.rc=1;t.cd=s.rate;snd('cannon');
    burst(t.x+Math.cos(t.ang)*.45,t.y+Math.sin(t.ang)*.45,'#ffd28a',6,2,.25,.06);
  }else if(t.type==='cryo'){
    const dur=hasP('frost')?2.2:1.6;
    for(const e of L){hurt(e,s.dmg,false,t);e.slowT=dur;e.slow=Math.max(e.slow,s.slow);
      if(s.brit)e.brit=Math.max(e.brit,s.brit);
      if(s.freeze&&Math.random()<s.freeze){e.frz=e.d.boss?.3:1;burst(e.x,e.y,'#dff8ff',6,1.2,.4,.06)}}
    S.fx.push({k:'ring',x:t.x,y:t.y,r:s.range,life:.45,max:.45,col:d.col});t.cd=s.rate;snd('cryo');
  }else if(t.type==='tesla'){
    const first=sorted(t,L)[0],hits=[first];let cur=first;
    for(let k=1;k<s.chains;k++){let best: Enemy|null=null,bd=1.7*1.7;for(const e of S.enemies){if(e.dead||hits.includes(e))continue;const dd=d2(e,cur);if(dd<bd){bd=dd;best=e}}if(!best)break;hits.push(best);cur=best}
    const pts=[{x:t.x,y:t.y-.18}];let dmg=s.dmg;
    for(const e of hits){pts.push({x:e.x,y:e.y});if(s.stun)e.stun=Math.max(e.stun,e.d.boss?.1:s.stun);hurt(e,dmg,false,t);dmg*=.86;burst(e.x,e.y,d.col,3,1.8,.3,.05)}
    S.fx.push({k:'arc',pts,life:.2,max:.2,col:d.col,seed:Math.random()*1e5});t.cd=s.rate;snd('tesla');
  }else if(t.type==='sniper'){
    const e=sorted(t,L)[0];aim(t,e,1);const crit=Math.random()<s.crit;
    S.fx.push({k:'trace',x:t.x+Math.cos(t.ang)*.5,y:t.y+Math.sin(t.ang)*.5,x2:e.x,y2:e.y,life:.22,max:.22,col:crit?'#ffffff':d.col});
    burst(e.x,e.y,d.col,crit?10:5,2.2,.35,.06);
    if(crit)text(e.x,e.y-.35,'КРИТ','#ffffff',.3,.7);
    hurt(e,s.dmg*(crit?3:1),!!s.pierce,t);t.rc=1;t.cd=s.rate;snd('sniper');
  }
}
/* enemy specials: healers, jammers, blinkers, bosses */
function enemyAct(e: Enemy,dt: number){
  const d=e.d;if(e.stun>0||e.frz>0)return;
  const onField=e.x>0&&e.y>0&&e.x<COLS&&e.y<ROWS;
  if(e.cd>0){e.cd-=dt;}
  if(e.cd>0)return;
  if(d.heal){e.cd=d.heal.cd;let n=0;const r2=d.heal.r*d.heal.r;
    for(const f of S.enemies){if(f.dead||f===e||f.hp>=f.max)continue;if(d2(f,e)<=r2){f.hp=Math.min(f.max,f.hp+f.max*(f.d.boss?.012:d.heal.p));n++;S.parts.push({x:f.x,y:f.y-.1,vx:0,vy:-.6,life:.5,max:.5,col:'#8dff5c',size:.07})}}
    if(n){S.fx.push({k:'heal',x:e.x,y:e.y,r:d.heal.r,life:.5,max:.5,col:d.col});snd('heal')}}
  else if(d.jam){const r2=d.jam.r*d.jam.r,hit=onField?S.towers.filter(t=>d2(t,e)<=r2):[];
    if(hit.length){e.cd=d.jam.cd;for(const t of hit){t.jam=Math.max(t.jam||0,d.jam.t)}S.fx.push({k:'jam',x:e.x,y:e.y,r:d.jam.r,life:.5,max:.5,col:d.col,seed:Math.random()*1e5});snd('jam')}
    else e.cd=.3}
  else if(d.blink){if(onField&&e.len-e.prog>d.blink.d+2){e.cd=d.blink.cd;const x0=e.x,y0=e.y;moveE(e,d.blink.d);S.fx.push({k:'blink',x:x0,y:y0,x2:e.x,y2:e.y,life:.4,max:.4,col:d.col});snd('blink')}else e.cd=.8}
  else if(d.brood){if(onField){e.cd=d.brood.cd*(e.phase>=2?.6:1);for(let k=0;k<d.brood.n;k++){const s=spawn(d.brood.t,e);s.hp*=.5;s.max*=.5;s.rw=Math.ceil(s.rw/2);s.x+=(Math.random()-.5)*.5;s.y+=(Math.random()-.5)*.5}
      S.fx.push({k:'pop',x:e.x,y:e.y,r:.9,life:.4,max:.4,col:d.col})}else e.cd=.5}
  else if(d.gun){const r2=d.gun.r*d.gun.r,c=onField?S.towers.filter(t=>!(t.off>0)&&d2(t,e)<=r2).sort((a,b)=>b.spent-a.spent):[];
    if(c.length){e.cd=d.gun.cd;for(const t of c.slice(0,e.phase>=1?2:1)){S.bshots.push({sx:e.x,sy:e.y,x:e.x,y:e.y,t,p:0,dur:.6,dis:d.gun.t});e.gunA=Math.atan2(t.y-e.y,t.x-e.x)}snd('wshot')}
    else e.cd=.4}
}
export function bossPhase(e: Enemy){
  e.phase=1;const d=e.d;
  if(e.t==='boss'){for(let k=0;k<3;k++){const g=spawn('guard',e);g.x+=Math.cos(k*2.1)*.45;g.y+=Math.sin(k*2.1)*.45;g.stun=.3+k*.25}e.sh=e.msh}
  else if(e.t==='queen'){for(let k=0;k<6;k++){const s=spawn('wasp',e);s.hp*=.5;s.max*=.5;s.rw=Math.ceil(s.rw/2);s.x+=(Math.random()-.5)*.8;s.y+=(Math.random()-.5)*.8}}
  else if(e.t==='wrecker'){e.cd=Math.min(e.cd,.8)}
  S.fx.push({k:'ring',x:e.x,y:e.y,r:2.2,life:.7,max:.7,col:d.col});S.shake=.4;snd('phase');say(BL[e.t]!.phase);text(e.x,e.y-.8,'Фаза 2','#ffb3c0',.34,1.2);
}
function bossRage(e: Enemy){e.phase=2;e.spd*=1.3;text(e.x,e.y-.8,'Ярость','#ff4d6d',.36,1.2);snd('phase');say(BL[e.t]!.rage)}
/* abilities */
export function useAbility(k: AbilityId){
  if(!S||S.over||S.perkPick||lobbyOn()||!SHEET.hidden)return;initAudio();
  if(S.ab[k]>0){toast(`${AB[k].name}: ещё ${Math.ceil(S.ab[k])} с`);return}
  if(k==='orbital'){S.aim=S.aim==='orbital'?null:'orbital';closeRadial(true);updInfo(true);return}
  if(k==='emp'){
    const dur=3+(lab('emp')?1.5:0);let n=0;
    for(const e of S.enemies){if(e.dead)continue;e.stun=Math.max(e.stun,e.d.boss?1:dur);n++}
    S.fx.push({k:'emp',x:COLS/2,y:ROWS/2,r:ROWS,life:.8,max:.8,col:'#3df0ff'});S.shake=.2;
    S.ab.emp=abCd('emp');snd('emp');toast(n?`ЭМИ: остановлено ${n}`:'ЭМИ: на поле никого');
  }
  if(k==='shield'){S.shieldT=12;S.shieldBlocks=0;S.ab.shield=abCd('shield');snd('shield');toast('Щит ядра: 12 с без потерь')}
  S.abilUsed++;qev('abil',1);
}
export function castOrbital(x: number,y: number){
  S.strikes.push({x,y,t:.7,r:1.5*(lab('orb')?1.2:1)});S.ab.orbital=abCd('orbital');S.aim=null;snd('orbital');S.abilUsed++;qev('abil',1);updInfo(true);
}
/* focus fire: tap an enemy and every tower that can reach it shoots it first */
/** enemy under a point on the field, for focus fire */
export function enemyAt(x: number,y: number){let best: Enemy|null=null,bd=1e9;for(const e of S.enemies){if(e.dead||(e.cloak&&!e.vis))continue;const ey=e.y-(e.air?.12:0),dd=(e.x-x)**2+(ey-y)**2,r=Math.max(.42,e.d.r+.18);if(dd<=r*r&&dd<bd){bd=dd;best=e}}return best}
export function setFocus(e: Enemy){S.focus={e,t:5};PROG.st.focus=(PROG.st.focus||0)+1;qev('focus',1);snd('focus');vib(10);S.fx.push({k:'lock',x:e.x,y:e.y,r:.9,life:.35,max:.35,col:'#ff4d6d'});updInfo(true)}
/* fork switch */
/** tile of the fork switch, or null on maps without one */
export function forkTile(): Tile|null{const m=S.map;if(m.fork==null)return null;const p=m.routes[0].pts[m.fork];return[p[0],p[1]]}
export function toggleFork(){S.sw^=1;snd('tap');vib(10);const ft=forkTile()!,fork=S.map.fork!,rt=S.map.routes[S.sw],a=rt.path[fork],b=rt.path[fork+1];
  S.fx.push({k:'ring',x:ft[0]+.5,y:ft[1]+.5,r:.7,life:.35,max:.35,col:'#ffe14d'});toast(`Стрелка: ${b.x<a.x?'налево':b.x>a.x?'направо':b.y>a.y?'вниз':'вверх'}`);updInfo(true)}
export function purge(){for(const e of S.enemies){if(e.dead)continue;e.dead=true;burst(e.x,e.y,e.d.col,10,2.6,.6,.08);S.fx.push({k:'pop',x:e.x,y:e.y,r:e.d.r*2.4,life:.4,max:.4,col:'#ffffff'})}
  S.queue=[];S.fx.push({k:'emp',x:COLS/2,y:ROWS/2,r:ROWS,life:1,max:1,col:'#ffb040'});S.shake=.5;snd('strike')}
/** advance the battle by dt seconds */
export function update(dt: number){
  S.time+=dt;
  for(const k of Object.keys(S.ab) as AbilityId[])S.ab[k]=Math.max(0,S.ab[k]-dt);
  if(S.shieldT>0)S.shieldT-=dt;
  if(S.focus){S.focus.t-=dt;if(S.focus.t<=0||S.focus.e.dead)S.focus=null}
  if(!S.flow&&!S.waveActive&&S.started&&!S.over&&S.countdown>0){S.countdown-=dt;if(S.countdown<=0){S.countdown=0;startWave()}}
  if(S.flow&&S.started&&!S.over){S.flowLeft-=dt;S.flowNext-=dt;
    if(S.flowNext<=0&&S.flowLeft>6)startWave();
    const flowT=S.mis!.flowT!;if((S.flowPerk===0&&S.flowLeft<=flowT-60)||(S.flowPerk===1&&S.flowLeft<=flowT-120)){S.flowPerk++;offerPerks()}
    if(S.flowLeft<=0){purge();endGame(true);return}}
  if(S.queue.length){S.spawnT-=dt;while(S.queue.length&&S.spawnT<=0){const it=S.queue.shift()!;spawn(it.t,null,it.l);if(ED[it.t].boss)vib(60);S.spawnT+=S.queue.length?S.queue[0].d:0}}
  if(S.curMods.includes('cloak')){const rad=S.towers.filter(t=>t.type==='cryo'||t.type==='tesla').map(t=>[t,stats(t).range**2] as [Tower,number]);
    for(const e of S.enemies)if(e.cloak)e.vis=rad.some(([t,r2])=>d2(e,t)<=r2)||S.towers.some(t=>d2(e,t)<=CLOAK_NEAR)}
  for(const e of S.enemies){
    if(e.dead)continue;
    e.hitT=Math.max(0,e.hitT-dt);e.stun=Math.max(0,e.stun-dt);e.frz=Math.max(0,e.frz-dt);
    if(e.slowT>0){e.slowT-=dt;if(e.slowT<=0){e.slow=0;e.brit=0}}
    if(e.wellT>0){e.wellT-=dt;if(e.wellT<=0)e.wellP=0}if(e.gnd>0)e.gnd-=dt;
    if(e.msh>0){if(e.shT>0)e.shT-=dt;else e.sh=Math.min(e.msh,e.sh+e.msh*.12*dt)}
    if(e.regen)e.hp=Math.min(e.max,e.hp+e.max*e.regen*dt);
    if(e.d.boss){if(!e.phase&&e.hp<e.max*.5)bossPhase(e);else if(e.phase===1&&e.hp<e.max*.25)bossRage(e)}
    enemyAct(e,dt);
    let sp=e.spd*(1-Math.max(e.slowT>0?e.slow:0,e.wellT>0?e.wellP:0));if(e.stun>0||e.frz>0)sp=0;
    moveE(e,sp*dt);
  }
  if(S.over)return;
  for(const t of S.towers)updTower(t,dt);
  for(const w of S.wells){w.t-=dt;const r2=w.r*w.r;
    for(const e of S.enemies){if(e.dead||d2(e,w)>r2)continue;const boss=e.d.boss;
      e.wellT=.15;e.wellP=Math.max(e.wellP||0,w.pull*(boss?.5:1));
      if(e.air&&!boss){if(!(e.gnd>0)){PROG.st.gnd=(PROG.st.gnd||0)+1;qev('gnd',1);if(PROG.st.gnd>=50)unlock('gravity')}e.gnd=Math.max(e.gnd||0,w.drag?3:1.2)}
      hurt(e,w.dps*dt,false,w.src);if(w.drag&&!boss&&!e.dead&&(e.dragD||0)<2.5){const dd=w.drag*dt;moveBack(e,dd);e.dragD=(e.dragD||0)+dd}}
    if(w.t<=0&&!w.done){w.done=true;if(w.boom){for(const e of S.enemies.slice())if(!e.dead&&d2(e,w)<=r2)hurt(e,w.boom,false,w.src);S.fx.push({k:'boom',x:w.x,y:w.y,r:w.r*1.2,life:.45,max:.45,col:'#9b7bff'});snd('boom')}}}
  S.wells=S.wells.filter(w=>!w.done);
  for(const b of S.bshots){b.p+=dt/b.dur;const q=Math.min(1,b.p);b.x=b.sx+(b.t.x-b.sx)*q;b.y=b.sy+(b.t.y-b.sy)*q;
    if(b.p>=1){b.done=true;if(S.towers.includes(b.t)){b.t.off=Math.max(b.t.off||0,b.dis);burst(b.t.x,b.t.y,'#ffb36b',18,2.4,.6,.07);S.fx.push({k:'boom',x:b.t.x,y:b.t.y,r:.6,life:.4,max:.4,col:'#ff6a2e'});text(b.t.x,b.t.y-.5,'Выведена из строя','#ff8a5c',.26,1.3);snd('boom')}}}
  S.bshots=S.bshots.filter(b=>!b.done);
  for(const st of S.strikes){st.t-=dt;if(st.t<=0&&!st.done){st.done=true;const k0=S.kills,dmg=(150+30*S.wave)*(lab('orb')?1.5:1);
      for(const e of S.enemies){if(e.dead)continue;const dd=Math.sqrt(d2(e,st));if(dd<=st.r)hurt(e,dmg*(1-.3*dd/st.r),true,null)}
      if(S.kills-k0>=5)unlock('orbital');
      S.fx.push({k:'beam',x:st.x,y:st.y,r:st.r,life:.6,max:.6,col:'#ff4fd8'});S.fx.push({k:'boom',x:st.x,y:st.y,r:st.r*1.2,life:.6,max:.6,col:'#ff4fd8'});
      burst(st.x,st.y,'#ff9ff0',40,4,.8,.09);burst(st.x,st.y,'#ffffff',16,2.5,.5,.07);S.shake=.45;snd('strike')}}
  S.strikes=S.strikes.filter(s=>!s.done);
  for(const p of S.proj){
    if(p.delay>0){p.delay-=dt;continue}
    p.p+=dt/p.dur;const q=Math.min(1,p.p);p.x=p.sx+(p.tx-p.sx)*q;p.y=p.sy+(p.ty-p.sy)*q;
    if(Math.random()<.6)S.parts.push({x:p.x,y:p.y-Math.sin(Math.PI*q)*p.h,vx:0,vy:0,life:.25,max:.25,col:'#ffae3d',size:.05});
    if(p.p>=1){p.done=true;
      for(const e of S.enemies){if(e.dead||isAir(e))continue;const dd=Math.sqrt(d2(e,p));if(dd<=p.sp)hurt(e,p.dmg*(1-.45*dd/p.sp),false,p.src)}
      S.fx.push({k:'boom',x:p.x,y:p.y,r:p.sp,life:.4,max:.4,col:'#ffae3d'});burst(p.x,p.y,'#ffbf5c',16,2.8,.5,.07);burst(p.x,p.y,'#ff5c3d',6,1.4,.7,.1);snd('boom')}
  }
  S.proj=S.proj.filter(p=>!p.done);
  S.enemies=S.enemies.filter(e=>!e.dead);
  for(const f of S.fx)f.life-=dt;S.fx=S.fx.filter(f=>f.life>0);
  for(const p of S.parts){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.g){p.vy+=p.g*dt;p.vx*=.97}else{p.vx*=.9;p.vy*=.9}}S.parts=S.parts.filter(p=>p.life>0);
  for(const t of S.texts){t.life-=dt;t.y-=dt*.7}S.texts=S.texts.filter(t=>t.life>0);
  if(S.flash>0)S.flash-=dt;if(S.shake>0)S.shake-=dt;
  if(S.gold>=1000)unlock('rich');
  if(S.waveActive&&!S.flow&&!S.queue.length&&!S.enemies.length&&!S.over){
    S.waveActive=false;PROG.waves++;qev('wave',1);genIncome(1);addXP(XP_WAVE);
    for(const k of S.curMods)if(!PROG.mods.includes(k))PROG.mods.push(k);if(PROG.mods.length>=5)unlock('mods');
    if(S.wave>=10)unlock('w10');
    if(S.mode==='endless'){if(S.wave>(PROG.best[S.mi]||0)){PROG.best[S.mi]=S.wave;S.newRec=true}if(S.wave>=40)unlock('endless40')}
    saveProg();
    if(S.wave>=maxW())endGame(true);
    else{S.countdown=15;toast(`Волна ${S.wave} отбита`);if(S.wave%5===0)offerPerks()}
    updInfo(true);tutEvent('clear');if(S.tut&&S.wave>=4)endTut();
  }
}
