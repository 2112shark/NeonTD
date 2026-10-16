// Run perk definitions.
/* run perks: one of three every five waves */
import type { TowerType } from './towers.ts';

export interface Perk {
  id: string; name: string; desc: string; col: string;
  /** icon key in PIC */
  ic: string;
  /** only offered when this tower is built */
  need?: TowerType;
}
export const PERKS: Perk[]=[
 {id:'dmg',name:'Калибровка',desc:'+12% урона всем башням',col:'#ff4fd8',ic:'aim'},
 {id:'rate',name:'Разгон',desc:'Все башни стреляют на 10% быстрее',col:'#ffe14d',ic:'fast'},
 {id:'rng',name:'Дальномер',desc:'+0.3 к дальности всех башен',col:'#3df0ff',ic:'range'},
 {id:'cheap',name:'Скидка',desc:'Улучшения на 15% дешевле',col:'#ffc94d',ic:'tag'},
 {id:'bounty',name:'Сбор данных',desc:'+2 кредита за каждого врага',col:'#ffc94d',ic:'coin'},
 {id:'air',name:'ПВО',desc:'+25% урона по летающим',col:'#4dffd2',ic:'wing'},
 {id:'boss',name:'Маяк',desc:'+25% урона по боссам',col:'#ff2e4d',ic:'aim'},
 {id:'hp',name:'Укрепление',desc:'+5 к прочности ядра',col:'#6dff9e',ic:'hex'},
 {id:'cd',name:'Перегрузка',desc:'Способности перезаряжаются на 30% быстрее',col:'#3df0ff',ic:'clock'},
 {id:'bank',name:'Вклад',desc:'Проценты 8%, лимит выше на 30',col:'#ffc94d',ic:'coin'},
 {id:'armor',name:'Бронебой',desc:'Броня врагов вдвое слабее',col:'#ff8a3d',ic:'burst'},
 {id:'chainx',name:'Цепная реакция',desc:'Враги взрываются при гибели и ранят соседей',col:'#ff8a3d',ic:'burst'},
 {id:'guard',name:'Аварийный щит',desc:'Первый прорыв в каждой волне блокируется, кроме босса миссии',col:'#6dff9e',ic:'hex'},
 {id:'chain',name:'Разветвление',desc:'Тесла бьёт на 2 цели больше',col:'#a98bff',ic:'bolt',need:'tesla'},
 {id:'frost',name:'Глубокий холод',desc:'Крио замедляет на 10% сильнее и дольше',col:'#7fe4ff',ic:'snow',need:'cryo'},
 {id:'blast',name:'Детонатор',desc:'Взрывы пушек на 30% шире',col:'#ffae3d',ic:'burst',need:'cannon'},
 {id:'crit',name:'Прицел',desc:'Снайпер: +15% к шансу крита',col:'#6dff9e',ic:'aim',need:'sniper'},
 {id:'lens',name:'Линза',desc:'Лазеры: +20% урона',col:'#ff4fd8',ic:'range',need:'laser'},
 {id:'heavy',name:'Тяжёлая гравитация',desc:'Воронки Гравитона на 30% шире и держат дольше',col:'#4d7bff',ic:'range',need:'gravi'},
 {id:'divid',name:'Дивиденды',desc:'Генераторы приносят на 50% больше',col:'#ffd84d',ic:'coin',need:'gen'},
];
export const PK_ID: Record<string, Perk>={};PERKS.forEach(p=>PK_ID[p.id]=p);
