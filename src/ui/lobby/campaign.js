// Lobby: campaign map, mission briefing, endless and daily screens.
import { r1 } from '../../core/util.ts';
import { PROG } from '../../meta/progress.ts';
import { labRaw } from '../../meta/lab.ts';
import { MAPS } from '../../data/maps.ts';
import { TD, TW_UNLOCK, TYPES } from '../../data/towers.ts';
import { MODS } from '../../data/enemies.ts';
import { CHAPTERS, MISSIONS, NM } from '../../data/campaign.ts';
import { allowedFor } from '../../core/map.ts';
import { dailyCfg } from '../../meta/daily.ts';
import { THEMES } from '../../render/map.js';
import { ACC, DIFFC, IC, STAR, dailyProg, fmtN, fmtTime, plural, streak, timeLeft } from './shared.js';
import { LBY, SCR, chapOpen, goalLong, goalShort, head, mDone, mOpen, mStars, misGold, misLives, resumable, starConds, starsMini } from './state.js';

function missionNode(M){const open=mOpen(M.i),done=mDone(M.i),cur=open&&!done,n=mStars(M.i),nm=mStars(M.i,true);
  return`<li class="mn${done?' done':''}${cur?' cur':''}${open?'':' locked'}${M.boss?' boss':''}"><button data-act="mis:${M.i}"${open?'':' disabled'} aria-label="Миссия ${M.i+1}: ${M.name}${open?'':', закрыта'}">
  <span class="hx"><i>${open?M.i+1:IC.lock}</i></span>
  <span class="t"><b>${M.name}</b><span>${cur?'Следующая. ':''}${goalShort(M)}</span></span>
  <span class="r">${done?starsMini(n):''}${nm?starsMini(nm,'nmst'):''}</span></button></li>`}
SCR.camp=()=>{const ci=LBY.chap,C=CHAPTERS[ci],ms=MISSIONS.filter(m=>m.ch===ci),got=ms.reduce((a,m)=>a+mStars(m.i),0),gotN=ms.reduce((a,m)=>a+mStars(m.i,true),0),boss=ms[ms.length-1];
  return`<div class="lb-in">${head('Кампания')}
  <div class="segs" role="tablist" aria-label="Глава">${CHAPTERS.map((c,i)=>`<button role="tab" aria-selected="${i===ci}" class="${i===ci?'on':''}" style="--sc:${THEMES[c.th].gate}" data-act="chap:${i}">${chapOpen(i)?'':IC.lock}Глава ${i+1}</button>`).join('')}</div>
  <section class="chap cut" style="--zc:${THEMES[C.th].gate}"><canvas width="192" height="240" data-mmap="${boss.i}"></canvas><div><span class="zn">Глава ${ci+1}</span><b>${C.name}</b><p>${C.sub}</p>
  <span class="cst"><span>${IC.starS}${got} из ${ms.length*3}</span>${gotN?`<span class="nmc">${IC.starS}${gotN} в кошмаре</span>`:''}</span></div></section>
  ${chapOpen(ci)?'':`<p class="lead">Глава откроется, когда вы пройдёте последнюю миссию предыдущей.</p>`}
  <ol class="route">${ms.map(missionNode).join('')}</ol>
  </div>`};
SCR.mission=()=>{const M=MISSIONS[LBY.mis],nmOpen=mDone(M.i),nm=LBY.nm&&nmOpen,mask=PROG.ms[(nm?'n':'')+M.id]||0,tw=allowedFor(M),newT=TYPES.find(k=>TW_UNLOCK[k]===M.i);
  return`<div class="lb-in">${head(`Миссия ${M.i+1}`,1)}
  <div class="mhero cut${nm?' nm':''}"><canvas width="240" height="300" data-mmap="${M.i}"></canvas><div class="mhi"><span class="zn">${CHAPTERS[M.ch].name}</span><b>${M.name}</b><span class="goal">${goalLong(M,nm)}</span></div></div>
  <section class="tx" aria-label="Брифинг"><div class="txh">${IC.vega}<span><b>ВЕГА</b><span>ИИ-оператор рубежа</span></span></div>${M.brief.map(l=>`<p>${l}</p>`).join('')}</section>
  ${nmOpen?`<div class="segs" role="tablist" aria-label="Сложность"><button role="tab" aria-selected="${!nm}" class="${nm?'':'on'}" data-act="nm:0">Обычная</button><button role="tab" aria-selected="${nm}" class="${nm?'on':''}" style="--sc:var(--pink)" data-act="nm:1">Кошмар</button></div>`:''}
  ${nm?`<p class="lead">Кошмар: враги крепче в ${r1(M.nmh||NM.hp)} раза, почти в каждой волне модификатор, а стартовых кредитов меньше.${M.boss?' Прорыв босса здесь сразу означает поражение.':''} Звёзды кошмара считаются отдельно.</p>`:''}
  <h3 class="sec">Звёзды${nm?' кошмара':''}</h3>
  <ul class="stl">${starConds(M).map((c,k)=>`<li class="${mask>>k&1?'got':''}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg><span>${c}</span>${mask>>k&1?'<em>Есть</em>':''}</li>`).join('')}</ul>
  <h3 class="sec">Башни</h3>
  <ul class="twl">${TYPES.filter(k=>TW_UNLOCK[k]<=M.i).map(k=>{const ban=!tw.includes(k);return`<li class="${ban?'ban':''}"><canvas width="64" height="64" data-tower="${k}"></canvas><span>${TD[k].name}</span>${k===newT?'<em>Новая</em>':ban?'<em class="no">Запрет</em>':''}</li>`}).join('')}</ul>
  <dl class="facts"><div><dt>${M.goal==='flow'?'Время':'Волн'}</dt><dd>${M.goal==='flow'?fmtTime(M.flowT):M.waves}</dd></div><div><dt>Кредиты</dt><dd>${misGold(M,nm)}</dd></div><div><dt>Ядро</dt><dd>${misLives(M)}</dd></div></dl>
  <div class="sticky"><div class="cta-glow${nm?' pink':''}"><button class="cta" data-act="mstart">${nm?'В бой: кошмар':'В бой'}</button></div>${resumable()?'<p class="note">Текущий бой будет прерван</p>':''}</div>
  </div>`};
export function briefHtml(){const i=LBY.sel,m=MAPS[i],tough=Math.round((m.hp/MAPS[0].hp-1)*100);
  return`<h3 class="sec">${m.name}: ${m.zone.toLowerCase()}</h3><p>${m.sub}</p><dl class="facts">
  <div><dt>Путь</dt><dd>${Math.round(m.len)} клеток</dd></div><div><dt>Сила врагов</dt><dd>${tough?'+'+tough+'%':'базовая'}</dd></div><div><dt>Рекорд</dt><dd>${PROG.best[i]?'волна '+PROG.best[i]:'нет'}</dd></div>
  <div><dt>Ядро</dt><dd>${20+5*labRaw('hp')}</dd></div><div><dt>Кредиты</dt><dd>${260+40*labRaw('cap')}</dd></div><div><dt>Волн</dt><dd>∞</dd></div></dl>`}
SCR.endless=()=>`<div class="lb-in wide">${head('Бесконечный',1)}
  <p class="lead">Волны идут без конца и после 30-й быстро крепнут. Каждые 10 волн приходит босс, каждые 5 можно взять перк. Все башни доступны сразу, рекорд хранится для каждой карты.</p>
  <div class="carousel" id="car">${MAPS.map((m,i)=>`<button class="mcard cut${i===LBY.sel?' on':''}" data-act="sel:${i}" aria-pressed="${i===LBY.sel}"><canvas width="480" height="600" data-map="${i}"></canvas><span class="mt"><b>${m.name}</b><span class="rec">${PROG.best[i]?'волна '+PROG.best[i]:'нет рекорда'}</span></span><span class="diff" style="--dc:${DIFFC[i]}">${[0,1,2].map(k=>`<i class="${k<=i?'on':''}"></i>`).join('')}<em>${m.diff}</em></span></button>`).join('')}</div>
  <div class="dots" aria-hidden="true">${MAPS.map((_,i)=>`<i class="${i===LBY.sel?'on':''}"></i>`).join('')}</div>
  <section class="brief" id="brief">${briefHtml()}</section>
  <div class="sticky"><div class="cta-glow"><button class="cta" data-act="start">В бой</button></div>${resumable()?'<p class="note">Текущий бой будет прерван</p>':''}</div>
  </div>`;
SCR.daily=()=>{const dc=dailyCfg(),dp=dailyProg(dc.key),st=streak(),date=new Date().toLocaleDateString('ru-RU',{day:'numeric',month:'long'});
  return`<div class="lb-in">${head('Вызов дня',1)}
  <div class="dhero cut"><canvas width="240" height="300" data-map="${dc.mi}"></canvas><div class="dhi"><span class="date">${date}</span><b>${MAPS[dc.mi].name}</b><span class="timer" data-timer>${timeLeft()}</span><span class="tl">до нового вызова</span></div></div>
  <h3 class="sec">Условия</h3>
  <ul class="rules">${dc.mods.map(k=>`<li><span class="chip" style="--cc:${MODS[k].col}">${MODS[k].name}</span>${MODS[k].long}. Действует с 3-й волны.</li>`).join('')}${dc.ban?`<li><span class="chip" style="--cc:#ff4d6d">Запрет</span>Строить ${ACC[dc.ban]} в этом вызове нельзя.</li>`:''}<li><span class="chip">Старт</span>${dc.gold} кредитов и 20 волн.</li><li><span class="chip">Равные условия</span>Лаборатория отключена, перки одинаковые для всех.</li></ul>
  <h3 class="sec">Счёт</h3>
  <p class="lead">10 очков за врага, 150 за каждую единицу прочности ядра, 100 за волну и 2000 за победу. Первая победа за день даёт ядро данных и продлевает серию.</p>
  <dl class="facts"><div><dt>Лучший сегодня</dt><dd>${dp?fmtN(dp.best):'—'}</dd></div><div><dt>Серия</dt><dd>${st} ${plural(st,['день','дня','дней'])}</dd></div><div><dt>Побед всего</dt><dd>${PROG.dailyWins||0}</dd></div></dl>
  <div class="sticky"><div class="cta-glow pink"><button class="cta" data-act="daily-start">${dp?'Сыграть ещё раз':'Принять вызов'}</button></div>${resumable()?'<p class="note">Текущий бой будет прерван</p>':''}</div>
  </div>`};
