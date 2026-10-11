// Lobby: lab, arsenal, shop.
import { PROG } from '../../meta/progress.js';
import { LAB_BR, labRaw, ptsFree } from '../../meta/lab.js';
import { TD, TYPES } from '../../data/towers.ts';
import { KFX, MAST, SKINS, mastLv, mastXP, skinFor, skinOwned } from '../../meta/mastery.js';
import { seasonInfo } from '../../meta/season.js';
import { SHOP, shopOwned, shopSeasonTier } from '../../meta/shop.js';
import { IC, PIC, fmtN } from './shared.js';
import { LBY, SCR, head } from './state.js';

function arsenalHtml(){return`<ul class="ars">${TYPES.map(k=>{const lv=mastLv(k),x=mastXP(k),nx=MAST[lv],prev=MAST[lv-1],f=nx?(x-prev)/(nx-prev):1,cur=skinFor(k);
  const skins=['base','chrome','gold','holo',...Object.keys(SKINS).filter(id=>!SKINS[id].m&&id!=='base'&&PROG.own&&PROG.own[id])];
  return`<li><div class="ah"><canvas width="96" height="96" data-tower="${k}" data-skin="${cur}"></canvas><div><b style="color:${TD[k].col}">${TD[k].name}</b><span>Мастерство ${lv}${lv>1?`, +${lv-1}% ${k==='gen'?'дохода':'урона'}`:''}</span></div><span class="ax">${nx?`${fmtN(x)} из ${fmtN(nx)}`:'Максимум'}</span></div>
  <span class="qbar"><i style="width:${Math.round(f*100)}%"></i></span>
  <div class="sk">${skins.map(id=>{const own=skinOwned(k,id),z=SKINS[id];return`<button class="skc${id===cur?' on':''}" data-act="skin:${k}:${id}"${own?'':' disabled'}><i class="${z.holo?'holo':''}" style="background:${z.holo?'':z.c||TD[k].col}"></i>${z.name}${own?'':`<small>ур. ${z.m}</small>`}</button>`}).join('')}</div></li>`}).join('')}</ul>
  <p class="lead">Мастерство растёт за каждого врага, которого уничтожили башни этого типа, а у генератора за заработанные кредиты. Облики сезона подходят к любой башне.</p>`}
function shopHtml(free){const si=seasonInfo();
  const row=it=>{const own=shopOwned(it),st=shopSeasonTier(it),z=it.k==='skin'?SKINS[it.id]:KFX[it.id];
    const pv=it.k==='skin'?`<canvas width="88" height="88" data-tower="laser" data-skin="${it.id}"></canvas>`:`<span class="fxi">${PIC.burst}</span>`;
    const right=own?'<span class="done">Есть</span>':st?`<span class="sea">Награда сезона<br>ступень ${st}</span>`:`<button class="buy" data-act="buy:${it.id}"${free<it.cost?' disabled':''}>Купить<em>${IC.core}${it.cost}</em></button>`;
    return`<li>${pv}<div><b>${z.name}</b><p>${it.k==='skin'?'Облик для любой башни':'Эффект уничтожения'}${it.cost>=60?'. Только в магазине':''}</p></div>${right}</li>`};
  return`<p class="lead">Ядра, оставшиеся после улучшений, можно обменять на облики и эффекты. Награды сезона «${si.def.name}» появятся здесь, когда он закончится.</p>
  <h3 class="sec">Облики башен</h3><ul class="nodes shop" style="--bc:var(--pink)">${SHOP.filter(it=>it.k==='skin').map(row).join('')}</ul>
  <h3 class="sec">Эффекты уничтожения</h3><ul class="nodes shop" style="--bc:var(--pink)">${SHOP.filter(it=>it.k==='fx').map(row).join('')}</ul>
  <p class="lead">Облики надеваются в Арсенале, эффект уничтожения выбирается в профиле. Если купленная вещь потом выпадет на сезонном треке, ядра за неё вернутся.</p>`}
SCR.lab=()=>{const tab=LBY.labTab>2?0:LBY.labTab,free=ptsFree();
  const tabs=`<div class="segs" role="tablist" aria-label="Раздел">${[['Улучшения','var(--accent)'],['Арсенал','#ffd84d'],['Магазин','var(--pink)']].map(([n,c],i)=>`<button role="tab" aria-selected="${i===tab}" class="${i===tab?'on':''}" style="--sc:${c}" data-act="labtab:${i}">${n}</button>`).join('')}</div>`;
  if(tab===1)return`<div class="lb-in">${head('Лаборатория')}
  <p class="lead">Арсенал: мастерство башен и их облики. Бонус мастерства действует в кампании и бесконечном режиме.</p>${tabs}${arsenalHtml()}</div>`;
  if(tab===2)return`<div class="lb-in">${head('Лаборатория')}${tabs}${shopHtml(free)}</div>`;
  return`<div class="lb-in">${head('Лаборатория')}
  <p class="lead">Ядра данных открывают постоянные улучшения для кампании и бесконечного режима. В вызовах они не действуют.</p>${tabs}
  ${LAB_BR.map(br=>`<h3 class="sec" style="color:${br.col}">${br.name}</h3><ul class="nodes" style="--bc:${br.col}">${br.nodes.map(n=>{const lv=labRaw(n.id),full=lv>=n.max,cost=full?0:n.cost[lv];
    return`<li><div><b>${n.name}</b><p>${n.desc}</p><span class="pips" role="img" aria-label="Уровень ${lv} из ${n.max}">${Array.from({length:n.max},(_,k)=>`<i class="${k<lv?'on':''}"></i>`).join('')}</span></div>${full?'<span class="done">Изучено</span>':`<button class="buy" data-act="learn:${n.id}"${free<cost?' disabled':''}>Изучить<em>${IC.core}${cost}</em></button>`}</li>`}).join('')}</ul>`).join('')}
  <p class="lead">Ядра дают звёзды миссий, достижения, задания, сезонный трек, победы в вызове дня и каждые 10 отбитых волн. Сброс возвращает ядра, потраченные на улучшения; покупки в магазине остаются.</p>
  <button class="textbtn danger" data-act="labreset">${LBY.arm==='labreset'?'Коснитесь ещё раз, чтобы сбросить':'Сбросить улучшения'}</button>
  </div>`};
