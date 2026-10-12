// Lobby: awards, quests, season, profile.
import { esc } from '../../core/util.ts';
import { PROG } from '../../meta/progress.ts';
import { NET } from '../../meta/net.ts';
import { ACH } from '../../meta/achievements.ts';
import { TD, TYPES } from '../../data/towers.ts';
import { MODS } from '../../data/enemies.ts';
import { MISSIONS } from '../../data/campaign.ts';
import { QIDX, QW_REW, Q_XP } from '../../data/quests.ts';
import { KFX, SKINS } from '../../meta/mastery.ts';
import { S_MAX, rewName, seasonInfo, seasonState, seasonTier, tierCost, tierRew, tierStart } from '../../meta/season.ts';
import { LEAGUES, leagueOf } from '../../meta/weekly.ts';
import { questReady, questState } from '../../meta/quests.ts';
import { IC, PIC, chevrons, fmtN, plural, rankInfo, timeLeft, weekLeft } from './shared.js';
import { LBY, SCR, head, mStars, weekRec } from './state.js';

function questLi(q,id,rew){const D=QIDX[q.id],done=q.p>=q.n,f=Math.min(1,q.p/q.n);
  return`<li class="${q.c?'claimed':done?'done':''}"><div class="qt"><b>${D.t(q.n)}</b><span class="qbar"><i style="width:${Math.round(f*100)}%"></i></span><span class="qn">${fmtN(Math.min(q.p,q.n))} из ${fmtN(q.n)}</span></div>
  ${q.c?'<span class="done">Получено</span>':`<button class="buy" data-act="claim:${id}"${done?'':' disabled'}>${done?'Забрать':'Награда'}<em>${rew}</em></button>`}</li>`}
function questsHtml(){const Q=questState();
  return`<div class="row-h"><h3 class="sec">Задания дня</h3><span class="timer">ещё <span data-timer>${timeLeft()}</span></span></div>
  <ul class="ql">${Q.list.map((q,i)=>questLi(q,'d'+i,`+${Q_XP} опыта`)).join('')}</ul>
  <p class="qall${Q.bonus?' got':''}">${IC.core}${Q.bonus?'Все задания дня выполнены: ядро данных получено':'Заберите все три задания дня и получите ядро данных'}</p>
  <div class="row-h"><h3 class="sec">Задание недели</h3><span class="timer">${weekLeft()}</span></div>
  <ul class="ql">${questLi(Q.wk,'w',`${IC.core}${QW_REW} и опыт`)}</ul>
  <p class="lead">Задания дня обновляются в полночь, недельное по понедельникам. Опыт идёт в сезонный трек.</p>`}
function rewIcon(r){return r.k==='core'?IC.core:r.k==='skin'?`<i class="swt" style="background:${SKINS[r.id].c||'#fff'}"></i>`:r.k==='fx'?PIC.burst:IC.gem}
function seasonHtml(){const si=seasonInfo(),s=seasonState(),tier=seasonTier(),into=s.xp-tierStart(tier),left=Math.max(1,Math.ceil((+si.end-Date.now())/864e5));
  return`<section class="scard cut" style="--zc:${si.def.col}"><span class="zn">Сезон ${si.num}</span><b>${si.def.name}</b><p>Ещё ${left} ${plural(left,['день','дня','дней'])}. Модификатор сезона в вызове недели: ${MODS[si.def.mod].name.toLowerCase()}.</p>
  <span class="tierl"><span>Ступень <b>${tier}</b> из ${S_MAX}</span><span>${tier<S_MAX?`${into} из ${tierCost(tier+1)} опыта`:'Трек пройден'}</span></span><span class="bar"><i style="width:${tier<S_MAX?Math.round(into/tierCost(tier+1)*100):100}%"></i></span></section>
  <p class="lead">Больше всего опыта дают задания дня и недели и первая за день победа в вызове дня, понемногу добавляют миссии и отбитые волны. Награды выдаются сразу.</p>
  <ol class="track">${Array.from({length:S_MAX},(_,i)=>{const t=i+1,r=tierRew(si.def,t),got=t<=tier;return`<li class="${got?'got':''}${t===tier+1?' next':''}${r.k!=='core'?' big':''}"><span class="tn">${t}</span><span class="trw">${rewIcon(r)}</span><span class="rn">${rewName(r)}</span>${got?'<em>Есть</em>':''}</li>`}).join('')}</ol>`}
function achHtml(){const got=ACH.filter(a=>PROG.ach[a[0]]).length,list=[...ACH].sort((a,b)=>(PROG.ach[b[0]]?1:0)-(PROG.ach[a[0]]?1:0)),sh=PROG.show||[];
  return`<div class="row-h"><h3 class="sec">Достижения</h3><span class="cnt">${got} из ${ACH.length}</span></div>
  <p class="lead">Отметьте звездой до трёх достижений, и они появятся на витрине профиля.</p>
  <ul class="achl">${list.map(a=>{const on=sh.includes(a[0]);return`<li class="${PROG.ach[a[0]]?'got':''}">${IC.gem}<div><b>${a[1]}</b><span>${a[2]}</span></div>${PROG.ach[a[0]]?`<button class="pin${on?' on':''}" data-act="show:${a[0]}" aria-pressed="${on}" aria-label="На витрину">${IC.starS}</button>`:''}</li>`}).join('')}</ul>`}
SCR.awards=()=>{const rk=rankInfo(),stars=Object.values(PROG.stars).reduce((a,b)=>a+b,0),got=ACH.filter(a=>PROG.ach[a[0]]).length,tab=LBY.atab,nq=questReady();
  return`<div class="lb-in">${head('Награды')}
  <div class="rankcard cut">${chevrons(rk.i+1)}<b>${rk.name}</b><span class="rk-n">${rk.next?`Ещё ${rk.next[0]-rk.xp} ${plural(rk.next[0]-rk.xp,['ядро','ядра','ядер'])} до звания «${rk.next[1]}». Всего получено: ${rk.xp}`:`Всего получено: ${rk.xp}. Это высшее звание`}</span><span class="bar"><i style="width:${Math.round(rk.prog*100)}%"></i></span></div>
  <ul class="earn"><li><b>${stars+(PROG.legacy||0)}</b>за звёзды</li><li><b>${got}</b>за достижения</li><li><b>${PROG.bonus||0}</b>за задания и сезон</li><li><b>${Math.floor(PROG.waves/10)+(PROG.dailyWins||0)}</b>за волны и вызовы</li></ul>
  <div class="segs" role="tablist" aria-label="Раздел">${[['quests','Задания'+(nq?` (${nq})`:'')],['season','Сезон'],['ach','Достижения']].map(([k,n])=>`<button role="tab" aria-selected="${tab===k}" class="${tab===k?'on':''}" data-act="atab:${k}">${n}</button>`).join('')}</div>
  ${tab==='quests'?questsHtml():tab==='season'?seasonHtml():achHtml()}
  </div>`};
SCR.profile=()=>{const rk=rankInfo(),st=PROG.st,ms=MISSIONS.filter(m=>PROG.ms[m.id]).length,stn=MISSIONS.reduce((a,m)=>a+mStars(m.i),0),stnN=MISSIONS.reduce((a,m)=>a+mStars(m.i,true),0),bosses=Object.values(st.boss||{}).reduce((a,b)=>a+b,0);
  const sh=(PROG.show||[]).filter(id=>PROG.ach[id]),shown=sh.length?sh:Object.keys(PROG.ach).sort((a,b)=>PROG.ach[b]-PROG.ach[a]).slice(0,3);
  const dmg=TYPES.filter(k=>k!=='gen').map(k=>[k,(st.dmg||{})[k]||0]),tot=dmg.reduce((a,b)=>a+b[1],0)||1,fav=Object.entries(st.spec||{}).sort((a,b)=>b[1]-a[1])[0];
  const own=PROG.own||{},titles=Object.keys(own).filter(k=>k.startsWith('t:')).map(k=>k.slice(2)),fxs=Object.keys(KFX).filter(k=>k==='none'||own['fx:'+k]);
  const best=Math.max(0,...Object.values(PROG.best||{})),wr=weekRec();
  return`<div class="lb-in">${head('Профиль',1)}
  <section class="pcard cut">${chevrons(rk.i+1)}<div class="pn"><b>${esc(NET.name||'Командир')}</b><span class="ptl">${PROG.title?esc(PROG.title):'Без титула'}</span><span class="rk-n">${rk.name}. ${rk.next?`Ещё ${rk.next[0]-rk.xp} ${plural(rk.next[0]-rk.xp,['ядро','ядра','ядер'])} до звания «${rk.next[1]}»`:'Высшее звание'}</span></div><span class="bar"><i style="width:${Math.round(rk.prog*100)}%"></i></span></section>
  <div class="row-h"><h3 class="sec">Витрина</h3><button class="textbtn" data-act="showedit">Выбрать</button></div>
  <ul class="showc">${[0,1,2].map(i=>{const a=shown[i]&&ACH.find(x=>x[0]===shown[i]);return a?`<li class="got">${IC.gem}<b>${a[1]}</b></li>`:`<li>${IC.gem}<b>Пусто</b></li>`}).join('')}</ul>
  <h3 class="sec">Статистика</h3>
  <dl class="facts">${[['Миссий',`${ms} из ${MISSIONS.length}`],['Звёзд',stn],['В кошмаре',stnN],['Уничтожено',fmtN(PROG.kills)],['Боссов',bosses],['Волн',fmtN(PROG.waves)],['Перков',st.perks||0],['Заданий',st.quests||0],['Лучшая волна',best||'—']].map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join('')}</dl>
  ${wr?`<p class="lead">Вызов недели: рекорд ${fmtN(wr.best)}, лига «${LEAGUES[leagueOf(wr.best)][0]}».</p>`:''}
  <h3 class="sec">Урон по башням</h3>
  <ul class="dmgl">${dmg.map(([k,v])=>`<li><span>${TD[k].name}</span><i><b style="width:${Math.round(v/tot*100)}%;background:${TD[k].col}"></b></i><em>${Math.round(v/tot*100)}%</em></li>`).join('')}</ul>
  ${fav?`<p class="lead">Любимая специализация: <b>${TD[fav[0].slice(0,-1)].br[fav[0].slice(-1)].name}</b>, открыта ${fav[1]} ${plural(fav[1],['раз','раза','раз'])}.</p>`:''}
  <h3 class="sec">Титул</h3><div class="chipsel">${['',...titles].map(t=>`<button class="csel${(PROG.title||'')===t?' on':''}" data-act="title:${esc(t)}">${t?esc(t):'Без титула'}</button>`).join('')}</div>
  <h3 class="sec">Эффект уничтожения</h3><div class="chipsel">${fxs.map(k=>`<button class="csel${(PROG.kfx||'none')===k?' on':''}" data-act="kfx:${k}">${KFX[k].name}</button>`).join('')}</div>
  ${titles.length?'':'<p class="lead">Титулы и эффекты открываются на сезонном треке, облики башен в Арсенале.</p>'}
  </div>`};
