// Lab upgrades bought with data cores.
import { PROG } from './progress.js';
import { MODE } from '../core/state.js';

export const labRaw=id=>PROG.lab[id]||0;
export const fair=()=>MODE==='daily'||MODE==='weekly';
export const lab=id=>fair()?0:labRaw(id);

export const LAB_BR=[
 {name:'Экономика',col:'#ffc94d',nodes:[
  {id:'cap',name:'Стартовый капитал',desc:'+40 кредитов на старте за уровень',max:3,cost:[1,2,3]},
  {id:'int',name:'Инвестиции',desc:'Проценты 6% вместо 5%, лимит 60',max:1,cost:[3]},
  {id:'rec',name:'Утилизация',desc:'Продажа возвращает 85% вместо 70%',max:1,cost:[2]},
  {id:'thr',name:'Бережливость',desc:'Постройка башен дешевле на 5% за уровень',max:2,cost:[2,3]}]},
 {name:'Оборона',col:'#ff4fd8',nodes:[
  {id:'dmg',name:'Калибровка',desc:'+8% урона всем башням за уровень',max:3,cost:[2,3,4]},
  {id:'rng',name:'Дальномеры',desc:'+0.25 к дальности всех башен',max:1,cost:[3]},
  {id:'hp',name:'Укреплённое ядро',desc:'+5 к прочности ядра за уровень',max:2,cost:[2,3]},
  {id:'vet',name:'Ветеранская выучка',desc:'Башни становятся ветеранами на 30% быстрее',max:1,cost:[2]}]},
 {name:'Штаб',col:'#3df0ff',nodes:[
  {id:'cd',name:'Быстрая перезарядка',desc:'Способности готовы на 15% быстрее за уровень',max:2,cost:[2,3]},
  {id:'orb',name:'Тяжёлый заряд',desc:'Орбитальный удар +50% урона и шире',max:1,cost:[2]},
  {id:'emp',name:'Долгий импульс',desc:'ЭМИ держит врагов на 1.5 с дольше',max:1,cost:[2]},
  {id:'foc',name:'Протокол фокуса',desc:'Цель под фокусом огня получает +15% урона',max:1,cost:[2]},
  {id:'perk',name:'Широкий выбор',desc:'Перк выбирается из четырёх вариантов',max:1,cost:[3]}]},
];
export const LAB=LAB_BR.flatMap(b=>b.nodes);
export function ptsTotal(){return Object.values(PROG.stars).reduce((a,b)=>a+b,0)+Object.keys(PROG.ach).length+Math.floor(PROG.waves/10)+(PROG.dailyWins||0)+(PROG.legacy||0)+(PROG.bonus||0)}
function ptsSpent(){let s=0;for(const n of LAB)for(let i=0;i<labRaw(n.id);i++)s+=n.cost[i];return s}
const sumV=o=>Object.values(o||{}).reduce((a,b)=>a+(+b||0),0);
export const shopSpent=()=>Math.max(0,sumV(PROG.buy)-sumV(PROG.refund));
export const ptsFree=()=>ptsTotal()-ptsSpent()-shopSpent();
