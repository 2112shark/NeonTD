// Results screen after a run.
import { $ } from '../core/util.ts';
import { S } from '../core/state.ts';
import { fair, ptsFree, ptsTotal } from '../meta/lab.ts';
import { TD, TW_UNLOCK, TYPES } from '../data/towers.ts';
import { MISSIONS } from '../data/campaign.ts';
import { maxW } from '../core/waves.ts';
import { rewName, seasonInfo, tierRew } from '../meta/season.ts';
import { LEAGUES, leagueOf } from '../meta/weekly.ts';
import { initAudio } from '../audio/sfx.ts';
import { END, IC, MODE_RU, STAR, fmtN, fmtTime, plural } from './lobby/shared.js';
import { LBY, runName, starConds } from './lobby/state.js';
import { openLobby } from './lobby/nav.js';
import { rerun } from './pauseSheet.js';

/* results */
function loseHint(){
  if(S.leakAir>S.leakGround)return'Прорывались летающие. Лазеры, крио и тесла бьют по воздуху, а пушка нет.';
  if(S.bossLeak||S.enemies.some(e=>e.d.boss))return'Босс дошёл до ядра. Копите ЭМИ и орбитальный удар к его появлению, фокусируйте огонь касанием и ставьте замедление на его пути.';
  if(S.wave<=3)return'Ранние волны решают всё. Постройте первые башни у поворотов ещё до старта.';
  if(!S.perks.length&&S.wave>=5)return'Перки дают заметный прирост. Выбирайте их после каждой пятой волны.';
  return'Улучшайте башни до третьего уровня и открывайте специализации: одна сильная башня лучше двух слабых.'}
export function showResults(r){
  const m=S.mode,win=r.won,gained=ptsTotal()-S.pts0,free=ptsFree(),M=S.mis;
  const title=M?(win?'Миссия выполнена':'Рубеж пал'):m==='daily'?(win?'Вызов пройден':'Вызов провален'):m==='weekly'?(win?'Вызов недели пройден':'Вызов недели завершён'):win?'Рубеж удержан':'Рубеж пал';
  let hero='',quote='';
  if(M){
    if(win)hero=`<div class="bigstars" role="img" aria-label="Звёзд: ${r.stars} из 3">${[0,1,2].map(k=>`<svg viewBox="0 0 24 24" class="${r.mask>>k&1?'on':''}" style="animation-delay:${(.2+k*.18).toFixed(2)}s"><path d="${STAR}"/></svg>`).join('')}</div>
      <ul class="stl mini res-stl">${starConds(M).map((c,k)=>`<li class="${r.mask>>k&1?'got':'miss'}"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="${STAR}"/></svg><span>${c}</span>${r.newMask>>k&1&&k?'<em>Новая</em>':''}</li>`).join('')}</ul>`;
    quote=`<div class="vq">${IC.vega}<p><b>ВЕГА</b>${win?M.win:loseHint()}</p></div>`;
  }
  else if(m==='weekly'){const L=LEAGUES[leagueOf(r.best)];hero=`<div class="score">${fmtN(r.score)}</div><span class="badge">${r.newBest?'Рекорд недели. ':''}Лига: <span style="color:${L[2]}">${L[0]}</span></span>`}
  else if(m==='daily')hero=`<div class="score">${fmtN(r.score)}</div>${r.newBest?'<span class="badge">Лучший счёт за сегодня</span>':''}`;
  else hero=`<div class="score">Волна ${S.wave}</div>${S.newRec?'<span class="badge">Новый рекорд карты</span>':''}`;
  const stats=[[S.flow?'Групп':'Волна',m==='endless'||S.flow?S.wave:`${S.wave} из ${maxW()}`],['Уничтожено',S.kills],[S.coreHp?'Ядра':'Ядро',S.coreHp?S.coreHp.join(' и '):`${S.lives} из ${S.maxLives}`],['Время',fmtTime(S.time)]];
  const nx=M&&win&&!S.nm?MISSIONS[M.i+1]:null;
  const main=nx?['next','Следующая миссия']:['retry','Ещё раз'];
  const second=nx?[['retry','Ещё раз'],['lobby','В лобби']]:[['lobby','В лобби']];
  let rew=(gained>0?`<span class="core">+${gained} ${plural(gained,['ядро','ядра','ядер'])} данных</span>`:'');
  if(M&&win&&r.first&&!S.nm){if(nx){const nt=TYPES.find(k=>TW_UNLOCK[k]===nx.i);rew+=`<span class="core">Открыта миссия ${nx.i+1}</span>`;if(nt)rew+=`<span>Новая башня: ${TD[nt].name}</span>`}rew+=`<span>Открыт «Кошмар»</span>`}
  if(S.xpGain)rew+=`<span class="xp">+${S.xpGain} опыта сезона</span>`;
  const def=seasonInfo().def;for(const t of S.newTiers||[])rew+=`<span class="xp">Ступень ${t}: ${rewName(tierRew(def,t))}</span>`;
  for(const [k,l] of S.mastUp||[])rew+=`<span>${TD[k].name}: мастерство ${l}</span>`;
  rew+=S.newAch.map(n=>`<span>${n}</span>`).join('');
  const res=$('#res');res.className='res cut '+(win?'win':'lose');
  res.innerHTML=`<h2 style="color:${win?'var(--accent)':'var(--warn)'}">${title}</h2><p class="sub">${M?runName():`${S.map.name}, ${MODE_RU[m]}`}</p>${hero}${quote}
  <div class="rstats">${stats.map(([a,b])=>`<div><span>${a}</span><b>${b}</b></div>`).join('')}</div>
  ${rew?`<div class="rew">${rew}</div>`:''}
  <div class="racts"><div class="cta-glow"><button class="cta" data-act="${main[0]}">${main[1]}</button></div><div class="pair">${second.map(([k,l])=>`<button class="btn2" data-act="${k}">${l}</button>`).join('')}</div>
  ${free>0&&!fair()?`<button class="textbtn" data-act="lab">Ядер в Лаборатории: ${free}. Потратить</button>`:''}</div>`;
  END.hidden=false;
}
END.addEventListener('click',e=>{const b=e.target.closest('[data-act]');if(!b)return;initAudio();const a=b.dataset.act;
  if(a==='next'){LBY.mis=S.mis.i+1;LBY.nm=false;LBY.chap=MISSIONS[LBY.mis].ch;openLobby('mission','camp')}
  else if(a==='retry'){END.hidden=true;rerun()}
  else if(a==='lobby')openLobby('home');
  else if(a==='lab')openLobby('lab')});
