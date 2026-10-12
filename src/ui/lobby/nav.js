// Lobby navigation, map carousel and lobby actions.
import { $ } from '../../core/util.ts';
import { PROG, freshProg, setPROG } from '../../meta/progress.ts';
import { lbSub, saveProg } from '../../meta/net.ts';
import { S, newGame } from '../../core/state.ts';
import { LAB, labRaw, ptsFree } from '../../meta/lab.ts';
import { MAPS } from '../../data/maps.ts';
import { MISSIONS } from '../../data/campaign.ts';
import { dayKey } from '../../meta/daily.ts';
import { skinOwned } from '../../meta/mastery.ts';
import { SHOP, shopBuy, shopOwned, shopSeasonTier } from '../../meta/shop.ts';
import { initAudio, muted, setMuted, snd } from '../../audio/sfx.ts';
import { hideComms, say } from '../comms.js';
import { claimQuest, questReady } from '../../meta/quests.ts';
import { renderCoach } from '../tutorial.js';
import { closeRadial } from '../radial.js';
import { iconCanvas, updInfo } from '../info.js';
import { hudLabels } from '../hud.js';
import { END, LBV, LOBBY, NAV, RM, SHEET, lobbyOn, vib } from './shared.js';
import { enemyIcon, mapPreview } from './widgets.js';
import { LBY, SCR, SUB, mDone, nextMission, resumable } from './state.js';
import { briefHtml } from './campaign.js';

const POST={
  home(){LBY.booted=true;drawPreviews()},
  camp(){drawPreviews()},
  mission(){drawPreviews();LBV.querySelectorAll('canvas[data-tower]').forEach(c=>iconCanvas(c,c.dataset.tower))},
  lab(){LBV.querySelectorAll('canvas[data-tower]').forEach(c=>iconCanvas(c,c.dataset.tower,{lvl:3,skin:c.dataset.skin}))},
  weekly(){drawPreviews();lbSub()},
  endless(){drawPreviews();initCarousel()},
  daily(){drawPreviews()},
  awards(){const n=Object.keys(PROG.ach).length;if((PROG.seenAch||0)!==n){PROG.seenAch=n;saveProg()}},
  codex(){LBV.querySelectorAll('canvas[data-tower]').forEach(c=>iconCanvas(c,c.dataset.tower));LBV.querySelectorAll('canvas[data-enemy]').forEach(c=>enemyIcon(c,c.dataset.enemy))}
};
function drawPreviews(){LBV.querySelectorAll('canvas[data-map]').forEach(c=>mapPreview(c,MAPS[+c.dataset.map]));LBV.querySelectorAll('canvas[data-mmap]').forEach(c=>mapPreview(c,MISSIONS[+c.dataset.mmap].map))}
function initCarousel(){
  const car=$('#car');if(!car)return;const cards=[...car.children];
  const center=(i,smooth)=>{const c=cards[i];if(!c||car.scrollWidth<=car.clientWidth+4)return;car.scrollTo({left:c.offsetLeft-(car.clientWidth-c.offsetWidth)/2,behavior:smooth&&!RM?'smooth':'auto'})};
  LBY.center=center;center(LBY.sel,false);
  let raf=0;
  car.addEventListener('scroll',()=>{if(raf)return;raf=requestAnimationFrame(()=>{raf=0;if(performance.now()<LBY.lock||car.scrollWidth<=car.clientWidth+4)return;
    const mid=car.scrollLeft+car.clientWidth/2;let best=0,bd=1e9;cards.forEach((c,i)=>{const d=Math.abs(c.offsetLeft+c.offsetWidth/2-mid);if(d<bd){bd=d;best=i}});
    if(best!==LBY.sel)selMap(best,false)})},{passive:true});
}
function selMap(i,scroll){LBY.sel=i;const car=$('#car');if(!car)return;
  [...car.children].forEach((c,k)=>{c.classList.toggle('on',k===i);c.setAttribute('aria-pressed',k===i)});
  LBV.querySelectorAll('.dots i').forEach((d,k)=>d.classList.toggle('on',k===i));$('#brief').innerHTML=briefHtml();
  if(scroll&&LBY.center){LBY.lock=performance.now()+450;LBY.center(i,true)}}
function updBadges(){
  const mark=(k,on)=>{const b=NAV.querySelector(`[data-go="${k}"]`);if(!b)return;let d=b.querySelector('.dot');if(on&&!d){d=document.createElement('i');d.className='dot';b.appendChild(d)}else if(!on&&d)d.remove()};
  const free=ptsFree();
  mark('lab',LAB.some(n=>{const lv=labRaw(n.id);return lv<n.max&&n.cost[lv]<=free})||(LAB.every(n=>labRaw(n.id)>=n.max)&&free>(PROG.shopSeen||0)&&SHOP.some(it=>!shopOwned(it)&&!shopSeasonTier(it)&&it.cost<=free)));
  mark('awards',(Object.keys(PROG.ach).length>(PROG.seenAch||0)&&LBY.scr!=='awards')||questReady()>0);
}
export function go(scr,instant){
  const same=scr===LBY.scr,top=LBV.scrollTop;
  if(!same){if(SUB[scr])LBY.back=SUB[LBY.scr]?LBY.back:(LBY.scr||'home');LBY.arm=null}
  LBY.scr=scr;LBV.innerHTML=SCR[scr]();LBV.scrollTop=same?top:0;
  LBV.classList.remove('enter','sub');
  if(!same&&!instant&&!RM){void LBV.offsetWidth;LBV.classList.add('enter');if(SUB[scr])LBV.classList.add('sub')}
  const tab=SUB[scr]?LBY.back:scr;
  NAV.querySelectorAll('button').forEach(b=>{const on=b.dataset.go===tab;b.classList.toggle('on',on);if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current')});
  if(POST[scr])POST[scr]();updBadges();
}
export function openLobby(scr,from){
  if(S){closeRadial();S.place=null;S.aim=null}
  SHEET.hidden=true;END.hidden=true;$('#pauseOv').hidden=true;LOBBY.hidden=false;LBY.scr=from||null;LBY.day=dayKey();
  if(from)LBY.back=from;
  go(scr||'home',true);renderCoach();hideComms();
}
function closeLobby(){LOBBY.hidden=true;renderCoach();updInfo(true);hudLabels()}
function launch(mi,mode,cfg){newGame(mi,mode,cfg);S.paused=false;$('#pauseOv').hidden=true;$('#bPause').textContent='❚❚';closeLobby();
  if(S.mis&&!S.tut)setTimeout(()=>{if(S&&!S.over&&!lobbyOn())say(S.mis.open)},600)}
export function act(a,v){
  const armed=LBY.arm===a;if(a!=='labreset'&&a!=='resetall')LBY.arm=null;
  switch(a){
    case'go':snd('tap');if(v==='camp'){const nx=nextMission();if(nx&&LBY.scr!=='camp')LBY.chap=nx.ch}go(v);break;
    case'back':snd('tap');go(LBY.back||'home');break;
    case'play':snd('tap');
      if(resumable()){S.paused=false;$('#bPause').textContent='❚❚';closeLobby()}
      else if(!PROG.tut&&!mDone(0))launch(0,'campaign');
      else{const nx=nextMission();if(nx){LBY.mis=nx.i;LBY.nm=false;LBY.chap=nx.ch;go('mission')}else go('camp')}break;
    case'chap':snd('tap');LBY.chap=+v;go('camp',true);break;
    case'mis':snd('tap');LBY.mis=+v;LBY.nm=false;go('mission');break;
    case'nm':snd('tap');LBY.nm=v==='1';go('mission',true);break;
    case'mstart':launch(LBY.mis,'campaign',{nm:LBY.nm&&mDone(LBY.mis)});break;
    case'sel':snd('tap');selMap(+v,true);break;
    case'start':launch(LBY.sel,'endless');break;
    case'daily-start':launch(0,'daily');break;
    case'weekly-start':launch(0,'weekly');break;
    case'season':snd('tap');LBY.atab='season';go('awards');break;
    case'showedit':snd('tap');LBY.atab='ach';go('awards');break;
    case'show':{const sh=PROG.show=(PROG.show||[]).filter(id=>PROG.ach[id]),i=sh.indexOf(v);if(i>=0)sh.splice(i,1);else{sh.push(v);if(sh.length>3)sh.shift()}saveProg();snd('tap');go('awards',true);break}
    case'skin':{const [k,id]=v.split(':');if(skinOwned(k,id)){PROG.skin=PROG.skin||{};PROG.skin[k]=id;saveProg();snd('tap');go('lab',true)}break}
    case'title':PROG.title=v;saveProg();snd('tap');go('profile',true);break;
    case'kfx':PROG.kfx=v;saveProg();snd('tap');go('profile',true);break;
    case'quests':snd('tap');LBY.atab='quests';go('awards');break;
    case'atab':snd('tap');LBY.atab=v;go('awards',true);break;
    case'claim':if(claimQuest(v)){snd('up');vib(15);go('awards',true)}break;
    case'labtab':LBY.labTab=+v;if(+v===2){PROG.shopSeen=ptsFree();saveProg()}snd('tap');go('lab',true);break;
    case'buy':if(shopBuy(v)){PROG.shopSeen=ptsFree();saveProg();snd('up');vib(15);go('lab',true)}break;
    case'learn':{const n=LAB.find(x=>x.id===v),lv=labRaw(n.id);if(lv<n.max&&ptsFree()>=n.cost[lv]){PROG.lab[n.id]=lv+1;saveProg();snd('up');vib(15);go('lab',true)}break}
    case'labreset':if(!armed){LBY.arm=a;go('lab',true);break}LBY.arm=null;PROG.lab={};saveProg();snd('sell');go('lab',true);break;
    case'codex':LBY.codex=v;snd('tap');go('codex',true);break;
    case'toggle':if(v==='sound'){setMuted(!muted);PROG.set.sound=!muted;if(!muted)snd('tap')}else{PROG.set.vib=!PROG.set.vib;vib(25)}saveProg();go('more',true);break;
    case'tut':PROG.tut=0;saveProg();launch(0,'campaign');break;
    case'resetall':if(!armed){LBY.arm=a;go('more',true);break}
      setPROG(Object.assign(freshProg(),{set:PROG.set,v:3}));saveProg();LBY.arm=null;if(S)S.started=false;snd('sell');go('home');break;
  }
}
LBV.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b||b.disabled)return;initAudio();const i=b.dataset.act.indexOf(':'),a=i<0?b.dataset.act:b.dataset.act.slice(0,i),v=i<0?'':b.dataset.act.slice(i+1);act(a,v)});
NAV.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;initAudio();if(b.dataset.go===LBY.scr){LBV.scrollTo({top:0,behavior:RM?'auto':'smooth'});return}act('go',b.dataset.go)});
