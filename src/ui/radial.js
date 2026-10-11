// Radial build/upgrade ring around the selected tile.
import { $, clamp } from '../core/util.js';
import { cv, tile } from '../render/canvas.js';
import { S } from '../core/state.js';
import { TD, TYPES } from '../data/towers.js';
import { MODE_NAMES } from '../data/enemies.js';
import { skinFor } from '../meta/mastery.js';
import { sellRate, stats, synFor, tcost, towerAt, ucost } from '../core/stats.js';
import { initAudio, snd } from '../audio/sfx.js';
import { toast } from './comms.js';
import { debCost, doClear } from '../core/combat.js';
import { build, buildBlock, isDebris, sell, shown, upgrade } from '../core/actions.js';
import { tutEvent } from './tutorial.js';
import { TCD, renderTCard } from './towerCard.js';
import { THEMES, drawDebris } from '../render/map.js';
import { iconCanvas, updInfo } from './info.js';

/* ---------- radial ring ---------- */
const RAD=$('#radial');export let radKey='';
export function openRadial(c,r){S.rad={c,r,deb:isDebris(c,r)};S.preview=null;S.rsel=null;S.sel=towerAt(c,r)||null;radKey='';renderRadial();updInfo(true);snd('tap');tutEvent('radial')}
export function closeRadial(keepAim){if(!S)return;S.rad=null;S.preview=null;S.rsel=null;S.sel=null;if(!keepAim)S.aim=null;RAD.hidden=true;RAD.innerHTML='';radKey='';TCD.hidden=true;S.lastUp=null;updInfo(true)}
function radItems(){
  if(S.rad.deb)return[{id:'clear',l:'Расчистить',cost:debCost(),col:'#ffb040'}];
  if(S.sel){const t=S.sel,d=TD[t.type],it=[];
    if(t.lvl<3)it.push({id:'up',l:`Улучшить<br>до ур. ${t.lvl+1}`,cost:ucost(t),col:d.col});
    else if(!t.br)for(const b of['A','B'])it.push({id:b,l:d.br[b].name,cost:ucost(t,b),col:d.col});
    if(t.type!=='gen')it.push({id:'mode',l:`Цель:<br>${MODE_NAMES[t.mode]}`,col:'#3df0ff'});
    it.push({id:'sell',l:'Продать',sale:Math.floor(t.spent*sellRate()),col:'#6dff9e'});
    return it}
  return TYPES.filter(shown).map(k=>({id:'b:'+k,type:k,cost:tcost(k),col:TD[k].col,ban:!S.allowed.includes(k)}));
}
// ring geometry: the radius grows with the tile so buttons clear the tile highlight; when the ring has to move away
// from a tile near an edge, the buttons are spread over the arc that stays clear of the tile
function ringLayout(n,px,py,fs,W,H,act){
  const iw=act?50:28,need=fs*.71+iw+10,gap=act?98:58;let R=Math.max(act?72:68,Math.round(need+2)),out=null;
  for(let k=0;k<10;k++){
    const M=R+iw+4,cx=clamp(px,M,W-M),cy=clamp(py,M,H-M),tx=px-cx,ty=py-cy,d=Math.hypot(tx,ty);
    let a0=-Math.PI/2,step=Math.PI*2/n;
    if(d>2&&n>1){const c=(R*R+d*d-need*need)/(2*R*d);if(c<1){const w=Math.acos(Math.max(-1,c)),at=Math.atan2(ty,tx);a0=at+w;step=(Math.PI*2-2*w)/(n-1)}}
    out={cx,cy,R,ang:Array.from({length:n},(_,i)=>a0+i*step)};
    if(2*R*Math.sin(Math.min(Math.PI/2,step/2))>=gap)break;
    R+=6}
  return out}
export function renderRadial(){
  if(!S.rad){RAD.hidden=true;return}
  const items=radItems(),key=JSON.stringify([S.rad,S.rsel,S.preview&&S.preview.type,items.map(i=>[i.id,i.l,i.cost!=null&&S.gold>=i.cost])]);
  if(key===radKey)return;radKey=key;
  const st=$('#stage'),n=items.length,fs=Math.max(30,tile+6),px=cv.offsetLeft+(S.rad.c+.5)*tile,py=cv.offsetTop+(S.rad.r+.5)*tile;
  const L=ringLayout(n,px,py,fs,st.clientWidth,st.clientHeight,!!S.sel),cx=L.cx,cy=L.cy,R=L.R;
  RAD.style.left=cx+'px';RAD.style.top=cy+'px';
  let h=`<div class="ring" style="left:${-R-26}px;top:${-R-26}px;width:${2*R+52}px;height:${2*R+52}px"></div>`;
  items.forEach((it,i)=>{const a=L.ang[i],x=Math.cos(a)*R,y=Math.sin(a)*R;
    const poor=it.cost!=null&&S.gold<it.cost;
    const on=(S.preview&&it.type===S.preview.type)||S.rsel===it.id;
    if(it.type)h+=`<button class="ri tw${poor?' poor':''}${on?' on':''}${it.ban?' ban':''}" data-id="${it.id}" style="left:${x}px;top:${y}px;--c:${it.col};animation-delay:${i*18}ms" aria-label="${TD[it.type].name}, ${it.cost}"><canvas width="72" height="72"></canvas><span class="c">${it.cost}</span></button>`;
    else h+=`<button class="ri act${it.id==='sell'?' sell':''}${on?' on':''}" data-id="${it.id}" style="left:${x}px;top:${y}px;--c:${it.col};animation-delay:${i*18}ms"${poor?' disabled':''}><span>${it.l}</span>${it.cost!=null?`<span class="c">${it.cost}</span>`:''}${it.sale!=null?`<span class="c">+${it.sale}</span>`:''}</button>`;
  });
  const go=(S.preview&&!S.sel)||(S.rsel&&S.rsel!=='mode');
  // range circles drawn above the ring so they are never hidden by it
  const tx=px-cx,ty=py-cy;
  h+=`<button class="rc${go?' go':''}" data-id="x" style="left:${tx}px;top:${ty}px;width:${fs}px;height:${fs}px" aria-label="${go?'Подтвердить':'Закрыть'}"><i>${go?'✓':'✕'}</i></button>`;
  const circ=(rng,col,cls)=>{if(!rng)return`<div class="rng sq" style="left:${tx}px;top:${ty}px;width:${tile*3}px;height:${tile*3}px;--c:${col}"></div>`;const d=rng*tile*2;return`<div class="rng${cls||''}" style="left:${tx}px;top:${ty}px;width:${d}px;height:${d}px;--c:${col}"></div>`};
  let pv=false;
  if(S.rad.deb)pv=!!S.rsel;
  else if(S.preview&&!S.sel){const p=S.preview,g={type:p.type,c:p.c,r:p.r,lvl:1,br:null,syn:synFor(p.type,p.c,p.r,null),node:S.grid[p.r][p.c]===3};h+=circ(stats(g).range,TD[p.type].col);pv=true}
  else if(S.sel){const t=S.sel,s=stats(t);h+=circ(s.range,TD[t.type].col);
    if(S.rsel==='up'||S.rsel==='A'||S.rsel==='B'){const nx={...t};if(S.rsel==='up')nx.lvl++;else nx.br=S.rsel;const ns=stats(nx);if(ns.range>s.range+.01)h+=circ(ns.range,'#6dff9e',' nx')}
    pv=!!S.rsel}
  RAD.classList.toggle('pv',pv);
  RAD.innerHTML=h;RAD.hidden=false;renderTCard(cy);
  RAD.querySelectorAll('.ri.tw canvas').forEach(c=>{const k=c.parentNode.dataset.id.slice(2);iconCanvas(c,k,{skin:skinFor(k)})});
}
function doBuild(){const p=S.preview;if(!p)return;const why=buildBlock(p.type);if(why){toast(why);return}if(S.gold<tcost(p.type)){toast('Не хватает кредитов');return}build(p.type,p.c,p.r);closeRadial()}
export function debrisIcon(cvs){const g=cvs.getContext('2d'),s=cvs.width;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,s,s);g.setTransform(s,0,0,s,0,0);drawDebris(g,0,0,THEMES[S.map.th||'net'],7)}
function doTowerAct(id){const t=S.sel;if(!t)return;
  if(id==='sell'){sell(t);closeRadial();return}
  if(upgrade(t,id==='up'?undefined:id)){S.rsel=null;radKey='';renderRadial();updInfo(true)}}
RAD.addEventListener('click',ev=>{
  const b=ev.target.closest('button');if(!b||!S||S.over)return;initAudio();const id=b.dataset.id;
  if(id==='clear'||(id==='x'&&S.rad.deb&&S.rsel==='clear')){if(S.rsel==='clear'){if(doClear(S.rad.c,S.rad.r))closeRadial()}else{S.rsel='clear';snd('tap');radKey='';renderRadial()}return}
  if(id==='x'){if(S.preview&&!S.sel)doBuild();else if(S.rsel)doTowerAct(S.rsel);else closeRadial();return}
  if(id.startsWith('b:')){const k=id.slice(2),why=buildBlock(k);if(why){toast(why);return}if(S.preview&&S.preview.type===k)doBuild();else{S.preview={type:k,c:S.rad.c,r:S.rad.r};snd('tap');radKey='';renderRadial();updInfo(true);tutEvent('preview')}return}
  if(id==='mode'){S.sel.mode=(S.sel.mode+1)%4;snd('tap');radKey='';renderRadial();updInfo(true);return}
  if(S.rsel===id)doTowerAct(id);else{S.rsel=id;snd('tap');radKey='';renderRadial();updInfo(true)}
});
export function setRadKey(v){return radKey=v}
