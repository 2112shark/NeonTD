// Lobby: home screen.
import { PROG } from '../../meta/progress.ts';
import { MAPS } from '../../data/maps.ts';
import { dailyCfg } from '../../meta/daily.ts';
import { IC, RM, chevrons, dailyProg, fmtN, plural, rankInfo, streak, timeLeft } from './shared.ts';
import { logo } from './widgets.ts';
import { LBY, SCR, coresPill, dailyChips, mDone, nextMission, questCard, resumable, runName, runProg, seasonStrip, weeklyCard } from './state.ts';

SCR.home=()=>{
  const rk=rankInfo(),dc=dailyCfg(),dp=dailyProg(dc.key),st=streak(),need=rk.next?rk.next[0]-rk.xp:0,nx=nextMission();
  let cta,sub;
  if(resumable()){cta='Продолжить бой';sub=`${runName()}. ${runProg()}`}
  else if(!PROG.tut&&!mDone(0)){cta='Начать игру';sub='Первая миссия с короткими подсказками'}
  else if(nx){cta='Продолжить кампанию';sub=`Миссия ${nx.i+1}: ${nx.name}`}
  else{cta='Кампания';sub='Все миссии пройдены. Испытайте себя в «Кошмаре»'}
  return`<div class="lb-in">
  <div class="home-top"><button class="rank" data-act="go:profile">${chevrons(rk.i+1)}<span><b>${rk.name}</b><small>${rk.next?`Ещё ${need} ${plural(need,['ядро','ядра','ядер'])} до звания «${rk.next[1]}»`:'Высшее звание'}</small></span></button>${coresPill()}</div>
  <div class="logo">${logo(!LBY.booted&&!RM)}</div>
  <div class="play"><div class="cta-glow"><button class="cta" data-act="play">${cta}</button></div><p class="cta-sub">${sub}</p>${resumable()?'<button class="textbtn" data-act="go:camp">К миссиям кампании</button>':''}</div>
  ${seasonStrip()}
  ${questCard()}
  <button class="dcard cut" data-act="go:daily"><span class="dh"><b>Вызов дня</b><span class="timer"><span data-timer>${timeLeft()}</span> до смены</span></span><span class="dm">${MAPS[dc.mi].name}</span><canvas width="96" height="120" data-map="${dc.mi}"></canvas><span class="chips">${dailyChips(dc)}</span><span class="dstats"><span><b>${dp?fmtN(dp.best):'—'}</b>лучший счёт</span><span><b>${st}</b>${plural(st,['день','дня','дней'])} подряд</span>${dp&&dp.won?'<span class="okmark">Пройден</span>':''}</span></button>
  ${weeklyCard()}
  <div class="tiles"><button class="tile" data-act="go:endless">${IC.inf}<b>Бесконечный</b><span>${Object.keys(PROG.best).length?`Рекорд: волна ${Math.max(...Object.values(PROG.best))}`:'Сколько волн продержитесь?'}</span></button><button class="tile" data-act="go:codex">${IC.book}<b>Справочник</b><span>Башни, враги, перки и модификаторы</span></button></div>
  </div>`};
