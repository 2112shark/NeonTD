// First-mission tutorial coach.
import { $, COLS, ROWS } from '../core/util.ts';
import { PROG } from '../meta/progress.ts';
import { saveProg } from '../meta/net.ts';
import { S } from '../core/state.ts';
import { TD } from '../data/towers.ts';
import { canBuild } from '../core/actions.ts';
import { SHEET, lobbyOn } from './lobby/shared.js';

/* ---------- tutorial ---------- */
const TUT=[
 'Коснитесь мигающей клетки: откроется кольцо постройки.',
 'Выберите Лазер. Первое касание показывает радиус и цену.',
 'Коснитесь Лазера ещё раз или ✓, чтобы построить.',
 'Постройте Пушку на второй мигающей клетке. Она бьёт по площади, но не достаёт летающих.',
 'Нажмите «Старт» вверху, чтобы запустить первую волну.',
 'Враги идут к ядру по светящемуся пути. Каждый прорыв отнимает прочность. Дождитесь конца волны.',
 'Между волнами начисляются проценты: 5% от ваших кредитов. Коснитесь башни и улучшите её.',
 'Внизу способности: Удар, ЭМИ и Щит. Включайте их, когда станет жарко. Разные башни рядом усиливают друг друга, связи видны пунктиром.'];
function bestTile(type){const range=TD[type].lv[0].range,r2=range*range,P=[],m=S.map;
  for(let i=0;i<m.path.length-1;i++){const a=m.path[i],b=m.path[i+1],L=Math.hypot(b.x-a.x,b.y-a.y);for(let s=0;s<L;s+=.25)P.push({x:a.x+(b.x-a.x)*s/L,y:a.y+(b.y-a.y)*s/L})}
  let best=null,bs=-1;for(let r=0;r<ROWS;r++)for(let c=0;c<COLS;c++){if(!canBuild(c,r))continue;let s=0;for(const p of P)if((p.x-c-.5)**2+(p.y-r-.5)**2<=r2)s++;if(s>bs){bs=s;best=[c,r]}}return best}
export function tutTile(){if(!S.tut)return null;const st=S.tut.step;if(st===0||st===1||st===2)return S.tut.t0||(S.tut.t0=bestTile('laser'));if(st===3)return S.tut.t1||(S.tut.t1=bestTile('cannon'));return null}
export function tutEvent(ev){
  const T=S&&S.tut;if(!T)return;const st=T.step;let n=st;
  if(ev==='radial'&&st===0)n=1;
  else if(ev==='preview'&&st===1)n=2;
  else if(ev==='build'){if(S.towers.length>=2&&st<4)n=4;else if(st<=2)n=3}
  else if(ev==='wave'&&st<=4)n=5;
  else if(ev==='clear'&&st===5)n=6;
  else if(ev==='upgrade'&&st>=5&&st<7)n=7;
  if(n!==st){T.step=n;renderCoach()}
}
export function endTut(){PROG.tut=1;saveProg();if(S)S.tut=null;renderCoach()}
export function renderCoach(){
  const box=$('#coach'),T=S&&S.tut;$('#bNext').classList.toggle('pulse',!!T&&T.step===4);document.querySelector('.abil').classList.toggle('pulse',!!T&&T.step===7);
  if(!T||lobbyOn()||!SHEET.hidden){box.hidden=true;return}
  box.hidden=false;$('#coachStep').textContent=`Обучение · ${T.step+1}/${TUT.length}`;$('#coachText').textContent=TUT[T.step];$('#coachOk').hidden=T.step!==TUT.length-1;
}
$('#coachSkip').onclick=endTut;$('#coachOk').onclick=endTut;
