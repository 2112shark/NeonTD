// Lobby: weekly challenge and leaderboard.
import { esc } from '../../core/util.ts';
import { NET } from '../../meta/net.ts';
import { MAPS } from '../../data/maps.ts';
import { MODS } from '../../data/enemies.ts';
import { seasonInfo } from '../../meta/season.ts';
import { LEAGUES, leagueOf, weeklyCfg } from '../../meta/weekly.ts';
import { fmtN, weekLeft } from './shared.ts';
import { SCR, head, resumable, weekRec } from './state.ts';

export function boardHtml(){
  if(!NET.db)return`<p class="lead">Общая таблица работает, когда игру открывают в Claude: в ней все, кто играет по этой ссылке. Ваш рекорд сохраняется в любом случае.</p>`;
  if(NET.state==='err')return`<p class="lead">Таблица сейчас недоступна. Ваш рекорд сохранён.</p>`;
  if(!NET.rows)return`<p class="lead">Загружаю таблицу.</p>`;
  if(!NET.rows.length)return`<p class="lead">На этой неделе ещё никто не играл. Станьте первым.</p>`;
  return`<ol class="board">${NET.rows.slice(0,20).map((r,i)=>{const me=r.id===NET.me,lg=LEAGUES[leagueOf(r.score)];
    return`<li class="${me?'me':''}"><span class="pl">${i+1}</span><span class="nm"><b>${esc(NET.names[r.id]||(me?'Вы':'Командир'))}</b>${r.title?`<small>${esc(r.title)}</small>`:''}</span><i class="lgm" style="--lc:${lg[2]}" title="${lg[0]}"></i><span class="sc">${fmtN(r.score)}</span></li>`}).join('')}</ol>`}
function weekSpan(){const n=new Date(),s=new Date(n.getFullYear(),n.getMonth(),n.getDate()-(n.getDay()+6)%7),e=new Date(s.getFullYear(),s.getMonth(),s.getDate()+6),f=(d: Date)=>d.toLocaleDateString('ru-RU',{day:'numeric',month:'long'});
  return s.getMonth()===e.getMonth()?`${s.getDate()}–${f(e)}`:`${f(s)} – ${f(e)}`}
SCR.weekly=()=>{const wc=weeklyCfg(),w=weekRec(),lg=leagueOf(w?w.best:0),def=seasonInfo().def;
  return`<div class="lb-in">${head('Вызов недели',1)}
  <div class="dhero cut wk"><canvas width="240" height="300" data-map="${wc.mi}"></canvas><div class="dhi"><span class="date">${weekSpan()}</span><b>${MAPS[wc.mi].name}</b><span class="timer">${weekLeft()}</span><span class="tl">до нового вызова</span></div></div>
  <h3 class="sec">Условия</h3>
  <ul class="rules">${wc.mods.map(k=>`<li><span class="chip" style="--cc:${MODS[k].col}">${MODS[k].name}${k===def.mod?', модификатор сезона':''}</span>${MODS[k].long}. Действует с 3-й волны.</li>`).join('')}<li><span class="chip">Старт</span>${wc.gold} кредитов и ${wc.waves} волн.</li><li><span class="chip">Равные условия</span>Лаборатория и мастерство отключены, перки одинаковые для всех.</li><li><span class="chip">Счёт</span>10 очков за врага, 150 за единицу прочности ядра, 100 за волну и 2000 за победу. После 30-й волны враги быстро крепнут: каждая волна дальше даёт заметно больше очков.</li></ul>
  <h3 class="sec">Лиги</h3>
  <ul class="leagues">${LEAGUES.map((L,i)=>`<li class="${w&&i===lg?'on':''}${w&&i<lg?' done':''}"><i class="lgm" style="--lc:${L[2]}"></i><b>${L[0]}</b><span>от ${fmtN(L[1])}</span></li>`).join('')}</ul>
  <dl class="facts"><div><dt>Ваш рекорд</dt><dd>${w?fmtN(w.best):'—'}</dd></div><div><dt>Лига</dt><dd>${w?LEAGUES[lg][0]:'—'}</dd></div><div><dt>Попыток</dt><dd>${w?w.plays:0}</dd></div></dl>
  <h3 class="sec">Таблица недели</h3><div id="board">${boardHtml()}</div>
  <div class="sticky"><div class="cta-glow"><button class="cta" data-act="weekly-start">${w?'Сыграть ещё раз':'Принять вызов'}</button></div>${resumable()?'<p class="note">Текущий бой будет прерван</p>':''}</div>
  </div>`};
