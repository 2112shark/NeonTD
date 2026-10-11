// Info panel under the battlefield.
import { $, r1 } from '../core/util.ts';
import { S } from '../core/state.ts';
import { lab } from '../meta/lab.js';
import { SYN, TD } from '../data/towers.ts';
import { ED, MODS } from '../data/enemies.ts';
import { PK_ID } from '../data/perks.ts';
import { genWave, maxW, waveMods } from '../core/waves.ts';
import { stats, synFor, tcost } from '../core/stats.ts';
import { SPEC_COL, drawTowerShape } from '../render/towers.js';
import { fmtTime } from './lobby/shared.js';

/* ---------- info panel ---------- */
const INFO=$('#info');let infoHtml='';
export function iconCanvas(cvs,type,t){const g=cvs.getContext('2d'),s=cvs.width;g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,s,s);g.setTransform(s*.86,0,0,s*.86,s*.07,s*.07);
  drawTowerShape(g,Object.assign({type,x:.5,y:.5,lvl:1,br:null,ang:-Math.PI/4,rc:0},t||{},{icon:true}),0)}
function statLine(type,s){
  const r=`дальн. ${r1(s.range)}`;
  switch(type){
    case'laser':return`урон ${Math.round(s.dps)}/с · ${r}${s.beams?' · 3 луча':''}${s.focus?' · до ×3':''}`;
    case'cannon':return`урон ${Math.round(s.dmg)} · взрыв ${r1(s.splash)} · ${r} · ${r1(s.rate)} с${s.shells?' · 3 снаряда':''}`;
    case'cryo':return`замедл. ${Math.round(s.slow*100)}% · урон ${Math.round(s.dmg)} · ${r}${s.freeze?' · заморозка':''}${s.brit?' · +30% урона':''}`;
    case'tesla':return`урон ${Math.round(s.dmg)} · цепь ${s.chains} · ${r}${s.stun?' · оглушение':''}`;
    case'sniper':return`урон ${Math.round(s.dmg)} · ${r} · ${r1(s.rate)} с · крит ${Math.round(s.crit*100)}%${s.pierce?' · сквозь броню':''}`;
    case'gravi':return`воронка ${r1(s.wr)} · удержание ${r1(s.dur)} с · замедл. ${Math.round(s.pull*100)}% · ${r}`;
    case'gen':return`доход +${Math.round(s.inc)} за волну · соседям +${Math.round(s.aura*100)}% урона`;
  }
}
function synChips(type,active){
  return SYN.filter(s=>s.to===type).map(s=>{const on=active.includes(s);return`<span class="chip${on?'':' off'}" style="--cc:${on?'#6dff9e':TD[s.from].col}">${s.name}: ${s.desc}${on?'':' · рядом '+TD[s.from].name.toLowerCase()}</span>`}).join('')
}
const INS={laser:'лазером',cannon:'пушкой',cryo:'крио',tesla:'теслой',sniper:'снайпером',gravi:'гравитоном',gen:'генератором'};
function synHint(){const ok=s=>S.allowed.includes(s.to)&&S.allowed.includes(s.from),r=SYN.find(s=>ok(s)&&s.to!==s.from)||SYN.find(ok);
  return r?`Соседи усиливают друг друга: ${TD[r.to].name.toLowerCase()} рядом с ${INS[r.from]} получает «${r.name}», ${r.desc}.`:''}
function nextLine(){
  if(S.over)return'';
  if(S.flow)return S.started?`<b>Поток.</b> Новая группа каждые 10 с, до продувки ${fmtTime(Math.max(0,S.flowLeft))}.`:'<b>Поток:</b> три минуты непрерывных волн. Подготовьтесь и нажмите «Старт».';
  const mw=maxW();if(S.wave>=mw&&!S.waveActive)return'';
  const w=S.wave+1;if(w>mw)return'<b>Последняя волна</b>';
  const q=genWave(w),c={};q.forEach(o=>c[o.t]=(c[o.t]||0)+1);const mods=waveMods(w);
  return`<b>Волна ${w}:</b> `+Object.entries(c).map(([k,n])=>`<span style="color:${ED[k].col}">${ED[k].name}</span> ${n}`).join(' · ')+mods.map(k=>` <span class="chip" style="--cc:${MODS[k].col}">${MODS[k].name}: ${MODS[k].desc}</span>`).join('');
}
export function updInfo(force){
  if(!S)return;let h;
  if(S.aim==='orbital'){h=`<div class="h"><span class="tn" style="color:#ff4fd8">Орбитальный удар</span><button class="cancel" data-a="cancel">Отмена</button></div>Коснитесь поля, куда ударить. Урон ${Math.round((150+30*Math.max(1,S.wave))*(lab('orb')?1.5:1))} по площади, бьёт и летающих.`}
  else if(S.sel){const t=S.sel,d=TD[t.type],s=stats(t);
    h=`<div class="h"><span class="tn" style="color:${t.br?SPEC_COL[t.type+t.br]:d.col}">${d.name}${t.br?': '+d.br[t.br].name:''}</span><span>уровень ${t.lvl} из 3</span></div><div>${synChips(t.type,t.syn||[])}</div>`;
  }
  else if(S.preview||S.place){const type=/** @type {TowerType} */((S.preview||{}).type||S.place),d=TD[type];
    const c=S.preview?S.preview.c:(S.hover||[])[0],r=S.preview?S.preview.r:(S.hover||[])[1];
    const act=c!=null?synFor(type,c,r,null):[];
    h=S.preview?`<div class="h"><span class="tn" style="color:${d.col}">${d.name}</span><span style="color:var(--gold)">${tcost(type)} кр.</span></div><div>${synChips(type,act)}</div>`
      :`<div class="h"><span class="tn" style="color:${d.col}">${d.name}</span><span style="color:var(--gold)">${tcost(type)}</span></div>${d.desc} <span class="sl">${statLine(type,stats({type,lvl:1,br:null,syn:act}))}</span><div>${synChips(type,act)}</div>`;
  }
  else{
    h=`<div>${nextLine()}</div>`;const ch=[];
    if(!S.over){
      if(S.limit)ch.push(`<span class="chip" style="--cc:#ffe14d">Башен ${S.towers.length} из ${S.limit}</span>`);
      if(S.mis)for(const b of S.mis.ban||[])ch.push(`<span class="chip" style="--cc:#ff4d6d">Запрещено: ${TD[b].name}</span>`);
      if(S.daily){if(S.daily.ban)ch.push(`<span class="chip" style="--cc:#ff4d6d">Запрещено: ${TD[S.daily.ban].name}</span>`);ch.push('<span class="chip">Лаборатория отключена</span>')}
      if(S.nm)ch.push('<span class="chip" style="--cc:#ff4fd8">Кошмар</span>');
      for(const id of S.perks.slice(0,3))ch.push(`<span class="chip" style="--cc:${PK_ID[id].col}">${PK_ID[id].name}</span>`);if(S.perks.length>3)ch.push(`<span class="chip">и ещё ${S.perks.length-3}</span>`);
    }
    if(ch.length)h+=`<div>${ch.join('')}</div>`;
    if(S.over){}
    else if(!S.towers.length)h+=`<div>Коснитесь свободной клетки, чтобы построить башню.${S.started?'':' Первая волна ждёт кнопку «Старт».'}</div>`;
    else if(S.focus)h+=`<div>Фокус огня: <b style="color:#ff4d6d">${S.focus.e.d.name}</b>, ещё ${Math.ceil(S.focus.t)} с.</div>`;
    else if(S.map.fork!=null&&!S.said.fork)h+=`<div>Коснитесь жёлтой стрелки на развилке, чтобы направить врагов по другой ветке.</div>`;
    else if(S.started&&!S.said.focusTip&&S.wave>=2)h+=`<div>Коснитесь врага, чтобы все башни рядом стреляли прежде всего по нему.</div>`;
    else if(S.links.length)h+=`<div>Активных синергий: <b>${S.links.length}</b></div>`;
    else{const sh=synHint();if(sh)h+=`<div>${sh}</div>`}
  }
  if(force||h!==infoHtml){infoHtml=h;INFO.innerHTML=h}
}
INFO.addEventListener('click',e=>{const b=e.target.closest('button');if(b&&b.dataset.a==='cancel'){S.aim=null;updInfo(true)}});
