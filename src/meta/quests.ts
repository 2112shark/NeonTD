// Quest progress and rewards.
import { hashS, rng } from '../core/util.ts';
import { PROG } from './progress.ts';
import { saveProg } from './net.ts';
import { S } from '../core/state.ts';
import { unlock } from './achievements.ts';
import { QD, QIDX, QW, QW_REW, QW_XP, Q_XP } from '../data/quests.ts';
import { dayKey, weekKey } from './daily.ts';
import { addXP } from './season.ts';
import { snd } from '../audio/sfx.js';
import { toast } from '../ui/comms.js';

/* ---------- quests ---------- */
/** today's quests, rolled fresh each day (and each week for the weekly one) */
export function questState(): QuestState & { wk: QuestProgress }{
  const day=dayKey(),wk=weekKey();let Q=PROG.q;
  if(!Q||Q.day!==day){const R=rng(hashS(day)+3),pool=QD.slice(),list: QuestProgress[]=[];
    while(list.length<3){const d=pool.splice(R()*pool.length|0,1)[0];list.push({id:d.id,n:d.n[R()*d.n.length|0],p:0,c:0})}
    Q={day,list,wkk:Q&&Q.wkk,wk:Q&&Q.wk};PROG.q=Q}
  if(Q.wkk!==wk||!Q.wk){const R=rng(hashS(wk)+5),d=QW[R()*QW.length|0];Q.wkk=wk;Q.wk={id:d.id,n:d.n[0],p:0,c:0}}
  return Q as QuestState & { wk: QuestProgress };
}
/** count a quest event; x is the payload filters look at (an enemy, a tower) */
export function qev(k: string,n: number,x?: unknown){
  const Q=questState();
  for(const q of Q.list.concat([Q.wk])){const D=QIDX[q.id];if(!D||q.p>=q.n||D.ev!==k||(D.f&&!(x&&D.f(x))))continue;
    q.p=Math.min(q.n,q.p+n);if(q.p>=q.n&&S&&!S.over){toast(`Задание выполнено: ${D.t(q.n)}`);snd('quest')}}
}
export const questReady=()=>{const Q=questState();return Q.list.concat([Q.wk]).filter(q=>q.p>=q.n&&!q.c).length};
/** claim a finished quest: 'w' for the weekly one, 'q0'..'q2' for daily ones */
export function claimQuest(v: string){const Q=questState(),wk=v==='w',q=wk?Q.wk:Q.list[+v.slice(1)];if(!q||q.p<q.n||q.c)return false;q.c=1;
  if(wk){PROG.bonus=(PROG.bonus||0)+QW_REW;addXP(QW_XP)}else{addXP(Q_XP);if(!Q.bonus&&Q.list.every(x=>x.c)){Q.bonus=1;PROG.bonus=(PROG.bonus||0)+1}}
  PROG.st.quests=(PROG.st.quests||0)+1;if(PROG.st.quests>=20)unlock('quests');saveProg();return true}
