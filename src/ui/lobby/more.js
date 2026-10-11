// Lobby: settings and codex.
import { r1 } from '../../core/util.js';
import { PROG } from '../../meta/progress.js';
import { MAPS } from '../../data/maps.js';
import { SYN, TD, TW_UNLOCK, TYPES } from '../../data/towers.js';
import { ED, MODS } from '../../data/enemies.js';
import { PERKS } from '../../data/perks.js';
import { muted } from '../../audio/sfx.js';
import { IC, canVib, cap } from './shared.js';
import { EINFO, baseStats, statRows } from './widgets.js';
import { LBY, SCR, head } from './state.js';

SCR.more=()=>`<div class="lb-in">${head('Ещё')}
  <ul class="mlist">
  <li><button data-act="toggle:sound" role="switch" aria-checked="${!muted}">${IC.sound}<span class="t"><b>Звук</b><span>Эффекты боя и интерфейса</span></span><i class="sw${muted?'':' on'}"></i></button></li>
  ${canVib?`<li><button data-act="toggle:vib" role="switch" aria-checked="${!!PROG.set.vib}">${IC.vib}<span class="t"><b>Вибрация</b><span>Отклик на постройку и прорывы</span></span><i class="sw${PROG.set.vib?' on':''}"></i></button></li>`:''}
  <li><button data-act="go:codex">${IC.book}<span class="t"><b>Справочник</b><span>Башни, враги, перки и модификаторы</span></span>${IC.chev}</button></li>
  <li><button data-act="tut">${IC.help}<span class="t"><b>Пройти обучение заново</b><span>Первая миссия с подсказками</span></span>${IC.chev}</button></li>
  </ul>
  <section class="kbd-sec"><h3 class="sec">Клавиатура</h3><dl class="keys"><dt>1–7</dt><dd>Выбрать башню для постройки</dd><dt>Q W E</dt><dd>Удар, ЭМИ, Щит</dd><dt>U</dt><dd>Улучшить выбранную башню</dd><dt>S</dt><dd>Продать</dd><dt>T</dt><dd>Сменить цель</dd><dt>N</dt><dd>Следующая волна</dd><dt>Пробел</dt><dd>Тактическая пауза</dd><dt>Esc</dt><dd>Меню паузы</dd></dl></section>
  <ul class="mlist"><li><button class="danger" data-act="resetall">${IC.reset}<span class="t"><b>${LBY.arm==='resetall'?'Коснитесь ещё раз для сброса':'Сбросить весь прогресс'}</b><span>Звёзды, рекорды, достижения, задания и исследования</span></span></button></li></ul>
  <p class="ver">Неоновый рубеж, версия 9</p>
  </div>`;
function codexTowers(){return`<ul class="cx">${TYPES.map(k=>{const d=TD[k],a=statRows(k,baseStats(k,1)),b=statRows(k,baseStats(k,3)),syn=SYN.filter(s=>s.to===k);
  return`<li><canvas width="96" height="96" data-tower="${k}"></canvas><div class="nm"><b style="color:${d.col}">${d.name}</b><span>${d.cost} кредитов</span></div><p>${d.desc}${TW_UNLOCK[k]?` В кампании с миссии ${TW_UNLOCK[k]+1}.`:''}</p>
  <div class="cxm"><table class="stt"><tr><th></th><th>Ур. 1</th><th>Ур. 3</th></tr>${a.map((r,i)=>`<tr><td>${r[0]}</td><td>${r[1]}</td><td>${b[i][1]}</td></tr>`).join('')}</table>
  <div>Улучшения стоят ${d.lv[1].cost} и ${d.lv[2].cost} кредитов, специализация ${d.br.A.cost}.</div>
  <div><b>${d.br.A.name}.</b> ${d.br.A.desc}.</div><div><b>${d.br.B.name}.</b> ${d.br.B.desc}.</div>
  ${syn.map(s=>`<div><b>${s.name}.</b> ${cap(s.desc)}, если рядом ${TD[s.from].name.toLowerCase()}.</div>`).join('')}</div></li>`}).join('')}</ul>`}
function codexEnemies(){return`<ul class="cx">${Object.keys(EINFO).map(k=>{const d=ED[k],[txt,w]=EINFO[k];
  return`<li><canvas width="96" height="96" data-enemy="${k}"></canvas><div class="nm"><b style="color:${d.col}">${d.name}</b><span>${typeof w==='string'?w:'с '+w+'-й волны'}</span></div><p>${txt}</p>
  <div class="cxm"><table class="stt"><tr><td>Здоровье на 1-й волне</td><td>${Math.round(d.hp*MAPS[0].hp)}</td></tr><tr><td>Скорость, клеток в секунду</td><td>${r1(d.spd)}</td></tr><tr><td>Награда, кредитов</td><td>${d.rw}</td></tr></table></div></li>`}).join('')}</ul>
  <p class="lead">Здоровье и волны указаны для Кольца в бесконечном режиме. В кампании враги появляются по сюжету миссий.</p>`}
function codexWaves(){return`<h3 class="sec">Перки</h3><p class="lead">После каждой пятой волны игра предлагает три перка. Выбранный действует до конца забега.</p><ul class="rules">${PERKS.map(p=>`<li><span class="chip" style="--cc:${p.col}">${p.name}</span>${p.desc}.</li>`).join('')}</ul>
  <h3 class="sec">Элементы карт</h3><ul class="rules"><li><span class="chip" style="--cc:#ffe14d">Энергоузел</span>Башня на светящемся гнезде бьёт на 25% сильнее и дальше на 0.5. Генератор на узле приносит больше.</li><li><span class="chip" style="--cc:#ffb040">Завал</span>Коснитесь завала у пути, чтобы расчистить его за кредиты и построить там башню.</li><li><span class="chip" style="--cc:#ffe14d">Развилка</span>Жёлтая стрелка решает, по какой ветке пойдут враги. Коснитесь её, чтобы переключить.</li></ul>
  <h3 class="sec">Ветераны и мастерство</h3><p class="lead">Башня, уничтожившая 20, 60 и 140 врагов, получает звёзды ветерана: +5% урона за каждую. Мастерство копится за всё время и даёт до +9% урона и облики в Арсенале.</p>
  <h3 class="sec">Фокус огня</h3><p class="lead">Коснитесь врага: на 5 секунд все башни, которые до него достают, стреляют прежде всего по нему. Полезно против Лекарей и боссов.</p>
  <h3 class="sec">Модификаторы</h3><ul class="rules">${Object.keys(MODS).map(k=>`<li><span class="chip" style="--cc:${MODS[k].col}">${MODS[k].name}</span>${MODS[k].long}.</li>`).join('')}</ul>
  <p class="lead">В бесконечном режиме модификаторы появляются с 6-й волны, в «Кошмаре» со 2-й. За врагов из такой волны платят на 20% больше.</p>
  <h3 class="sec">Экономика</h3><ul class="rules"><li><span class="chip" style="--cc:#ffc94d">Проценты</span>Перед каждой волной начисляется 5% от ваших кредитов, но не больше 40.</li><li><span class="chip" style="--cc:#3df0ff">Досрочно</span>Вызовите волну раньше таймера и получите 2 кредита за каждую оставшуюся секунду.</li><li><span class="chip" style="--cc:#6dff9e">Продажа</span>Башня возвращает 70% вложенного.</li></ul>
  <h3 class="sec">Синергии</h3><ul class="rules">${SYN.map(s=>`<li><span class="chip" style="--cc:${TD[s.to].col}">${s.name}</span>${TD[s.to].name}: ${s.desc}, если рядом стоит ${TD[s.from].name.toLowerCase()}.</li>`).join('')}</ul>`}
SCR.codex=()=>`<div class="lb-in">${head('Справочник',1)}<div class="segs" role="tablist" aria-label="Раздел">${[['towers','Башни'],['enemies','Враги'],['waves','Правила']].map(([k,n])=>`<button role="tab" aria-selected="${LBY.codex===k}" class="${LBY.codex===k?'on':''}" data-act="codex:${k}">${n}</button>`).join('')}</div>${LBY.codex==='towers'?codexTowers():LBY.codex==='enemies'?codexEnemies():codexWaves()}</div>`;
