// Tower card with stats and upgrade preview.
import { $, r1 } from '../core/util.ts';
import { S } from '../core/state.ts';
import { TD } from '../data/towers.ts';
import { skinFor } from '../meta/mastery.js';
import { genAura, sellRate, stats, synFor, tcost, ucost } from '../core/stats.ts';
import { debCost } from '../core/combat.ts';
import { debrisIcon } from './radial.js';
import { SPEC_COL } from '../render/towers.js';
import { iconCanvas } from './info.js';
import { GEN } from './lobby/shared.js';

/* ---------- tower card: stats, upgrade preview with deltas ---------- */
export const TCD=$('#tcard');
const SK={wr:['Радиус воронки',r1],dur:['Удержание',v=>r1(v)+' с'],pull:['Замедление',v=>Math.round(v*100)+'%'],inc:['Доход за волну',v=>'+'+Math.round(v)],aura:['Усиление соседей',v=>'+'+Math.round(v*100)+'%'],dps:['Урон в секунду',v=>Math.round(v)],dmg:['Урон',v=>Math.round(v)],splash:['Радиус взрыва',r1],chains:['Целей в цепи',v=>Math.round(v)],slow:['Замедление',v=>Math.round(v*100)+'%'],crit:['Шанс крита',v=>Math.round(v*100)+'%'],range:['Дальность',r1],rate:['Перезарядка',v=>r1(v)+' с']};
const SKEYS={laser:['dps','range'],cannon:['dmg','splash','range','rate'],cryo:['slow','dmg','range','rate'],tesla:['dmg','chains','range','rate'],sniper:['dmg','crit','range','rate'],gravi:['pull','wr','dur','dps','range'],gen:['inc','aura']};
/** @type {Record<string,string>} */
export const SHORT={wr:'воронка',dur:'удерж.',pull:'замедл.',inc:'доход',aura:'усил.',dps:'урон',dmg:'урон',splash:'взрыв',chains:'цели',slow:'замедл.',crit:'крит',range:'дальн.',rate:'перезар.'};
const TARGET_RU=['первый в колонне','последний в колонне','самый крепкий','ближайший'];
export function dFmt(k,d){const a=Math.abs(d),s=d>0?'+':'−';return k==='slow'||k==='crit'||k==='pull'||k==='aura'?s+Math.round(a*100)+'%':k==='rate'||k==='dur'?s+r1(a)+' с':k==='range'||k==='splash'||k==='wr'?s+r1(a):s+Math.round(a)}
export function statDiff(type,a,b){return SKEYS[type].filter(k=>Math.abs((b[k]||0)-(a[k]||0))>1e-6).map(k=>({k,d:b[k]-a[k],good:k==='rate'?b[k]<a[k]:b[k]>a[k]}))}
const tcGrid=(type,s)=>`<div class="tc-g">${SKEYS[type].map(k=>`<div>${SK[k][0]}<b>${SK[k][1](s[k])}</b></div>`).join('')}</div>`;
const tcHead=(title,sub,right)=>`<div class="tc-h"><canvas width="72" height="72"></canvas><div class="tc-t"><b>${title}</b>${sub?`<span>${sub}</span>`:''}</div>${right||''}</div>`;
export function renderTCard(cy){
  if(!S||!S.rad||(!S.preview&&!S.sel&&!S.rad.deb)){TCD.hidden=true;return}
  let h='',col,icon;
  if(S.rad.deb){const cost=debCost(),poor=S.gold<cost;col='#ffb040';icon=null;
    h=tcHead('Завал','Расчистка освободит клетку для башни у самого пути',`<span class="tc-c${poor?' poor':''}">${cost} кр.</span>`)+`<p class="tc-hint${poor?' poor':''}">${poor?'Не хватает кредитов':S.rsel==='clear'?'Коснитесь ещё раз или ✓, чтобы расчистить':'Каждый следующий завал дороже на 25 кредитов'}</p>`}
  else if(S.preview&&!S.sel){
    const p=S.preview,d=TD[p.type],act=synFor(p.type,p.c,p.r,null),s=stats({type:p.type,lvl:1,br:null,syn:act}),cost=tcost(p.type),poor=S.gold<cost;
    col=d.col;icon={type:p.type,lvl:1,br:null,skin:skinFor(p.type)};
    h=tcHead(d.name,d.air?'Бьёт по земле и воздуху':'Только наземные цели',`<span class="tc-c${poor?' poor':''}">${cost} кр.</span>`)+tcGrid(p.type,s)
      +(act.length?`<p class="tc-n"><b>Синергия:</b> ${act.map(r=>`${r.name}, ${r.desc}`).join('; ')}.</p>`:'')
      +`<p class="tc-hint${poor?' poor':''}">${poor?'Не хватает кредитов':'Коснитесь значка ещё раз или ✓, чтобы построить'}</p>`;
  }else{
    const t=S.sel,d=TD[t.type],s=stats(t);col=t.br?SPEC_COL[t.type+t.br]:d.col;icon=t;
    if(S.rsel==='up'||S.rsel==='A'||S.rsel==='B'){
      const nx={...t};let cost,title,sub;
      if(S.rsel==='up'){nx.lvl=t.lvl+1;cost=ucost(t);title=`${d.name}: уровень ${t.lvl+1}`;sub=`Сейчас уровень ${t.lvl} из 3`}
      else{nx.br=S.rsel;cost=ucost(t,S.rsel);title=d.br[S.rsel].name;sub=`Специализация для ${GEN[t.type]}`;col=SPEC_COL[t.type+S.rsel]}
      const ns=stats(nx),diff=statDiff(t.type,s,ns),poor=S.gold<cost;icon=nx;
      h=tcHead(title,sub,`<span class="tc-c${poor?' poor':''}">${cost} кр.</span>`)
        +(diff.length?`<div class="tc-cmp">${diff.map(x=>`<div><span>${SK[x.k][0]}</span><b>${SK[x.k][1](s[x.k])}<i>→</i>${SK[x.k][1](ns[x.k])}</b><em class="${x.good?'':'bad'}">${dFmt(x.k,x.d)}</em></div>`).join('')}</div>`:'')
        +(S.rsel!=='up'?`<p class="tc-n"><b>Особенность:</b> ${d.br[S.rsel].desc}.</p>`:'')
        +`<p class="tc-hint${poor?' poor':''}">${poor?'Не хватает кредитов':'Коснитесь ещё раз или ✓, чтобы улучшить'}</p>`;
    }else if(S.rsel==='sell'){
      const v=Math.floor(t.spent*sellRate());
      h=tcHead(`Продать: ${d.name.toLowerCase()}`,`Вложено ${t.spent} кредитов`,`<span class="tc-c ok">+${v} кр.</span>`)+`<p class="tc-hint">Коснитесь ещё раз или ✓, чтобы продать</p>`;
    }else{
      const ga=genAura(t),ex=[t.vet?`<b>Ветеран ${'★'.repeat(t.vet)}:</b> +${t.vet*5}% урона`:'',t.node?'<b>Энергоузел:</b> сильнее и дальше':'',ga?`<b>Генератор рядом:</b> +${Math.round(ga.aura*100)}% урона`:''].filter(Boolean);
      h=tcHead(`${d.name}${t.br?': '+d.br[t.br].name:''}`,t.type==='gen'?`Уровень ${t.lvl} из 3. Заработано: ${t.made||0}`:`Уровень ${t.lvl} из 3. Уничтожено: ${t.kills}`,'')+tcGrid(t.type,s)
        +(ex.length?`<p class="tc-n">${ex.join('. ')}.</p>`:'')
        +(t.off>0||t.jam>0?`<p class="tc-hint poor">${t.off>0?'Выведена из строя':'Заглушена'}: ещё ${Math.ceil(Math.max(t.off||0,t.jam||0))} с</p>`:'')
        +(S.lastUp&&S.lastUp.t===t&&S.lastUp.diff.length?`<p class="tc-up">Улучшено: ${S.lastUp.diff.map(x=>`${dFmt(x.k,x.d)} ${SHORT[x.k]}`).join(', ')}</p>`:'')
        +(t.type==='gen'?'':`<p class="tc-n"><b>Цель:</b> ${TARGET_RU[t.mode]}.${t.syn&&t.syn.length?` <b>Синергия:</b> ${t.syn.map(r=>r.name).join(', ')}.`:''}</p>`);
    }
  }
  TCD.style.setProperty('--tc',col);TCD.innerHTML=h;
  const st=$('#stage'),top=cy>st.clientHeight/2;TCD.classList.toggle('top',top);TCD.classList.toggle('bot',!top);TCD.hidden=false;
  const c=TCD.querySelector('canvas');if(c&&icon)iconCanvas(c,icon.type,{...icon,x:.5,y:.5,ang:-Math.PI/4,rc:0,syn:[],fm:1});else if(c)debrisIcon(c);
}
