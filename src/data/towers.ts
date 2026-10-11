// Tower definitions, unlock order and synergies.
export type TowerType='laser'|'cannon'|'cryo'|'tesla'|'sniper'|'gravi'|'gen';

/** Stats a level or a specialization sets; anything not listed is inherited from the level before. */
export interface TowerStats {
  dps?: number; dmg?: number; range?: number; rate?: number; cost?: number;
  splash?: number; shells?: number; slow?: number; freeze?: number; brit?: number;
  chains?: number; stun?: number; crit?: number; pierce?: number; focus?: number; beams?: number;
  pull?: number; wr?: number; dur?: number; boom?: number; drag?: number;
  inc?: number; aura?: number; bank?: number; haste?: number;
}
export interface TowerBranch extends TowerStats { name: string; desc: string; cost: number }
export interface TowerDef {
  name: string; col: string; cost: number;
  /** 1 if it can hit flying enemies */
  air: 0 | 1;
  desc: string;
  /** levels 1..3 */
  lv: TowerStats[];
  /** specializations after level 3 */
  br: { A: TowerBranch; B: TowerBranch };
}
/**
 * Effective stats of a built tower (see stats() in core/stats). Only the keys its levels and branch set are present;
 * the rest read as undefined at runtime, and code checks them where it matters.
 */
export type Stats = Record<Exclude<keyof TowerStats, 'cost'>, number>;
export interface Synergy { to: TowerType; from: TowerType; name: string; desc: string; f: (s: Stats) => void }

export const TYPES: TowerType[]=['laser','cannon','cryo','tesla','sniper','gravi','gen'];
export const TD: Record<TowerType, TowerDef>={
 laser:{name:'Лазер',col:'#ff4fd8',cost:60,air:1,desc:'Непрерывный луч по одной цели. Бьёт по земле и воздуху.',
  lv:[{dps:24,range:2.8},{dps:40,range:3.1,cost:55},{dps:62,range:3.4,cost:95}],
  br:{A:{name:'Фокус',desc:'Урон растёт до ×3, пока луч держит цель',cost:190,dps:78,focus:1},B:{name:'Призма',desc:'Три луча по разным целям',cost:190,dps:52,beams:3}}},
 cannon:{name:'Пушка',col:'#ffae3d',cost:80,air:0,desc:'Снаряды со взрывом по площади. Не достаёт летающих.',
  lv:[{dmg:26,range:2.4,rate:1.1,splash:.85},{dmg:44,splash:.95,cost:70},{dmg:72,splash:1.1,range:2.6,cost:120}],
  br:{A:{name:'Мортира',desc:'Дальность 4.2, урон ×2.4, шире взрыв',cost:230,dmg:175,range:4.2,rate:1.7,splash:1.45},B:{name:'Залп',desc:'Три снаряда по разным целям',cost:230,dmg:80,shells:3}}},
 cryo:{name:'Крио',col:'#7fe4ff',cost:70,air:1,desc:'Импульс замедляет всех врагов в радиусе. Видит невидимок.',
  lv:[{dmg:5,range:2,rate:.9,slow:.35},{dmg:9,slow:.45,range:2.2,cost:60},{dmg:14,slow:.55,range:2.4,cost:100}],
  br:{A:{name:'Абсолютный ноль',desc:'15% шанс заморозить врага на 1 с',cost:200,freeze:.15,dmg:20},B:{name:'Хрупкость',desc:'Замедленные враги получают +30% урона',cost:200,brit:.3,range:2.8}}},
 tesla:{name:'Тесла',col:'#a98bff',cost:110,air:1,desc:'Молния перескакивает между врагами. Видит невидимок.',
  lv:[{dmg:20,range:2.3,rate:1,chains:3},{dmg:32,chains:4,cost:90},{dmg:48,chains:5,range:2.5,cost:140}],
  br:{A:{name:'Буря',desc:'Цепь до 10 целей',cost:260,chains:10,dmg:54},B:{name:'Перегрузка',desc:'Оглушает цели на 0.45 с',cost:260,stun:.45,dmg:66}}},
 sniper:{name:'Снайпер',col:'#6dff9e',cost:120,air:1,desc:'Большая дальность, 20% шанс крита ×3.',
  lv:[{dmg:70,range:4,rate:2,crit:.2},{dmg:115,range:4.4,cost:110},{dmg:180,range:4.8,cost:170}],
  br:{A:{name:'Бронебой',desc:'Урон 320, полностью игнорирует броню',cost:300,dmg:320,pierce:1},B:{name:'Скорострел',desc:'Выстрел каждую секунду',cost:300,rate:1}}},
 gravi:{name:'Гравитон',col:'#4d7bff',cost:100,air:1,desc:'Ставит гравитационную воронку: враги в ней вязнут, а летающие падают на землю, где их достаёт пушка.',
  lv:[{pull:.55,wr:.95,dur:2.2,dps:8,range:2.6,rate:4},{pull:.6,wr:1.1,dur:2.6,dps:14,cost:80},{pull:.65,wr:1.25,dur:3,dps:22,range:2.9,cost:130}],
  br:{A:{name:'Сингулярность',desc:'Воронка жжёт сильнее и в конце схлопывается взрывом',cost:240,dps:55,boom:170},B:{name:'Горизонт событий',desc:'Воронка шире и тянет врагов назад по пути',cost:240,wr:1.6,pull:.75,drag:.45}}},
 gen:{name:'Генератор',col:'#ffd84d',cost:90,air:0,desc:'Не стреляет. После каждой волны приносит кредиты и усиливает башни на соседних клетках.',
  lv:[{inc:12,aura:.08},{inc:22,aura:.12,cost:70},{inc:34,aura:.16,cost:110}],
  br:{A:{name:'Биржа',desc:'+70 кредитов за волну, лимит процентов выше на 20',cost:200,inc:70,bank:20},B:{name:'Усилитель',desc:'Соседи получают +30% урона и стреляют на 10% быстрее',cost:200,aura:.3,haste:.1}}},
};
// campaign mission index from which a tower can be built
export const TW_UNLOCK: Record<TowerType, number>={laser:0,cannon:0,cryo:1,tesla:5,sniper:7,gravi:10,gen:12};
export const SYN: Synergy[]=[
 {to:'tesla',from:'cryo',name:'Сверхпроводимость',desc:'+20% урона',f:s=>{s.dmg*=1.2}},
 {to:'cryo',from:'tesla',name:'Ионизация',desc:'+0.4 дальности',f:s=>{s.range+=.4}},
 {to:'laser',from:'sniper',name:'Наводка',desc:'+15% урона',f:s=>{s.dps*=1.15}},
 {to:'sniper',from:'laser',name:'Лазерный прицел',desc:'+15% шанс крита',f:s=>{s.crit+=.15}},
 {to:'cannon',from:'cryo',name:'Хрупкий металл',desc:'+25% радиус взрыва',f:s=>{s.splash*=1.25}},
 {to:'cannon',from:'cannon',name:'Батарея',desc:'стрельба на 15% быстрее',f:s=>{s.rate*=.85}},
 {to:'cannon',from:'gravi',name:'Гравилинза',desc:'+15% урона',f:s=>{s.dmg*=1.15}},
 {to:'gravi',from:'cryo',name:'Криостаз',desc:'воронка держит на 0.5 с дольше',f:s=>{s.dur+=.5}},
];
