// Quest progress and rewards.
import { hashS, rng } from '../core/util.js';
import { PROG } from './progress.js';
import { saveProg } from './net.js';
import { S } from '../core/state.js';
import { unlock } from './achievements.js';
import { QD, QIDX, QW, QW_REW, QW_XP, Q_XP } from '../data/quests.js';
import { dayKey, weekKey } from './daily.js';
import { addXP } from './season.js';
import { snd } from '../audio/sfx.js';
import { toast } from '../ui/comms.js';

/* ---------- quests ---------- */
export function questState(){
  const day=dayKey(),wk=weekKey();let Q=PROG.q;
  if(!Q||Q.day!==day){const R=rng(hashS(day)+3),pool=QD.slice(),list=[];
    while(list.length<3){const d=pool.splice(R()*pool.length|0,1)[0];list.push({id:d.id,n:d.n[R()*d.n.length|0],p:0,c:0})}
    Q={day,list,wkk:Q&&Q.wkk,wk:Q&&Q.wk};PROG.q=Q}
  if(Q.wkk!==wk||!Q.wk){const R=rng(hashS(wk)+5),d=QW[R()*QW.length|0];Q.wkk=wk;Q.wk={id:d.id,n:d.n[0],p:0,c:0}}
  return Q;
}
export function qev(k,n,x){
  const Q=questState();
  for(const q of Q.list.concat([Q.wk])){const D=QIDX[q.id];if(!D||q.p>=q.n||D.ev!==k||(D.f&&!(x&&D.f(x))))continue;
    q.p=Math.min(q.n,q.p+n);if(q.p>=q.n&&S&&!S.over){toast(`Задание выполнено: ${D.t(q.n)}`);snd('quest')}}
}
export const questReady=()=>{const Q=questState();return Q.list.concat([Q.wk]).filter(q=>q.p>=q.n&&!q.c).length};
export function claimQuest(v){const Q=questState(),wk=v==='w',q=wk?Q.wk:Q.list[+v.slice(1)];if(!q||q.p<q.n||q.c)return false;q.c=1;
  if(wk){PROG.bonus=(PROG.bonus||0)+QW_REW;addXP(QW_XP)}else{addXP(Q_XP);if(!Q.bonus&&Q.list.every(x=>x.c)){Q.bonus=1;PROG.bonus=(PROG.bonus||0)+1}}
  PROG.st.quests=(PROG.st.quests||0)+1;if(PROG.st.quests>=20)unlock('quests');saveProg();return true}
