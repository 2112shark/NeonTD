// Daily and weekly quest definitions.
import { fmtN } from '../ui/lobby/shared.js';

/* quests */
export const QD=[
 {id:'kill',ev:'kill',n:[150,250],t:n=>`Уничтожьте ${n} врагов`},
 {id:'air',ev:'kill',n:[30,50],f:x=>x.air,t:n=>`Уничтожьте ${n} летающих врагов`},
 {id:'tank',ev:'kill',n:[15,25],f:x=>x.t==='tank',t:n=>`Уничтожьте ${n} Броневиков`},
 {id:'medic',ev:'kill',n:[8,12],f:x=>x.t==='medic',t:n=>`Уничтожьте ${n} Лекарей`},
 {id:'wave',ev:'wave',n:[15,25],t:n=>`Отбейте ${n} волн`},
 {id:'spec',ev:'spec',n:[2,3],t:n=>`Откройте ${n} специализации башен`},
 {id:'up',ev:'up',n:[10,16],t:n=>`Улучшите башни ${n} раз`},
 {id:'mis',ev:'mwin',n:[1,2],t:n=>n>1?`Пройдите ${n} миссии кампании`:'Пройдите миссию кампании'},
 {id:'abil',ev:'abil',n:[5,8],t:n=>`Примените способности ${n} раз`},
 {id:'boss',ev:'boss',n:[1],t:()=>'Уничтожьте любого босса'},
 {id:'daily',ev:'dwin',n:[1],t:()=>'Пройдите вызов дня'},
 {id:'perk',ev:'perk',n:[2,3],t:n=>`Возьмите ${n} перка`},
 {id:'focus',ev:'focus',n:[5,10],t:n=>`Сфокусируйте огонь ${n} раз`},
 {id:'build',ev:'build',n:[12,20],t:n=>`Постройте ${n} башен`},
 {id:'int',ev:'int',n:[150,250],t:n=>`Получите ${n} кредитов процентами`},
 {id:'gnd',ev:'gnd',n:[15,25],t:n=>`Уроните гравитоном ${n} летающих врагов`},
 {id:'clear',ev:'clear',n:[2,3],t:n=>`Расчистите ${n} завала`},
 {id:'vet',ev:'vet',n:[2,3],t:n=>`Вырастите ${n} ветеранов`},
];
export const QW=[
 {id:'wkill',ev:'kill',n:[1500],t:n=>`Уничтожьте ${fmtN(n)} врагов`},
 {id:'wwave',ev:'wave',n:[100],t:n=>`Отбейте ${n} волн`},
 {id:'wmis',ev:'mwin',n:[6],t:n=>`Пройдите ${n} миссий кампании`},
 {id:'wboss',ev:'boss',n:[4],t:n=>`Уничтожьте ${n} боссов`},
 {id:'wdaily',ev:'dwin',n:[3],t:n=>`Пройдите вызов дня ${n} раза`},
];
export const QIDX={};QD.concat(QW).forEach(q=>QIDX[q.id]=q);
export const Q_XP=100,QW_XP=400,QW_REW=2;
