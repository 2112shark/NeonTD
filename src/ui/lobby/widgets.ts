// Lobby widgets: logo, map previews, enemy icons, stat tables.
import { COLS, r1 } from '../../core/util.ts';
import { glow, poly } from '../../render/canvas.ts';
import { TD, type Stats } from '../../data/towers.ts';
import { ED } from '../../data/enemies.ts';
import { THEMES, drawDeco, paintMap } from '../../render/map.ts';
import { drawEnemy } from '../../render/enemies.ts';
import { drawSwitch } from '../../render/draw.ts';

/** the neon-tube logo SVG; boot plays the ignition animation */
export function logo(boot?: boolean){
  const L=[['gR',0],['gU',48],['gB',96],['gE',142],['gZ',186]];
  return`<svg class="lg${boot?' boot':''}" viewBox="0 0 300 190" role="img" aria-label="Неоновый рубеж"><defs>
<filter id="lgB" filterUnits="userSpaceOnUse" x="-30" y="-30" width="360" height="250"><feGaussianBlur stdDeviation="3.2"/></filter>
<path id="gR" d="M0 56V8Q0 0 8 0H20A14 14 0 0 1 20 28H0"/>
<path id="gU" d="M0 0 21 30M34 0 14 46Q10 56 2 56"/>
<path id="gB" d="M32 0H4Q0 0 0 4V56H18A14 14 0 0 0 18 28H0"/>
<path id="gE" d="M30 0H4Q0 0 0 4V52Q0 56 4 56H30M0 28H22"/>
<path id="gZ" d="M24 0V56M0 0Q16 24 24 28M0 56Q16 32 24 28M48 0Q32 24 24 28M48 56Q32 32 24 28"/>
<path id="gN" d="M78 76V90M88 76V90M78 83H88M106 76H97V90H106M97 83H104M118 76H122Q125 76 125 79V87Q125 90 122 90H118Q115 90 115 87V79Q115 76 118 76ZM134 76V90M144 76V90M134 83H144M156 76H160Q163 76 163 79V87Q163 90 160 90H156Q153 90 153 87V79Q153 76 156 76ZM172 83H178Q182 83 182 86.5Q182 90 178 90H172V76H177Q181 76 181 79.5Q181 83 177 83M191 76V90H195Q199 90 199 86.5Q199 83 195 83H191M203 76V90M212 76V90L222 76V90M215 72Q217 74.5 219 72"/>
<path id="gW" d="M33 178H117V171H129V178H144V171H156V178H171V171H183V178H267"/>
<path id="gH" d="M150 10 170.8 22V46L150 58 129.2 46V22Z"/>
<path id="gI" d="M161.5 34 155.75 44H144.25L138.5 34 144.25 24H155.75Z"/>
<path id="gS" d="M96 34H122M178 34H204"/>
</defs>
<g class="em"><use href="#gS" class="sg"/><use href="#gH" class="tg" filter="url(#lgB)"/><use href="#gH" class="tt"/><g class="spin"><use href="#gI" class="pg" filter="url(#lgB)"/><use href="#gI" class="pt"/></g><circle cx="150" cy="34" r="3.6" class="dotc"/></g>
<g class="pkw"><use href="#gN" class="pg" filter="url(#lgB)"/><use href="#gN" class="pt"/><use href="#gN" class="pc"/></g>
<g transform="translate(33 104)">${L.map(([id,x],i)=>`<g class="L" style="--i:${i}" transform="translate(${x} 0)"><g${i===2?' class="fl"':''}><use href="#${id}" class="tg" filter="url(#lgB)"/><use href="#${id}" class="tt"/><use href="#${id}" class="tc"/></g></g>`).join('')}</g>
<g class="wall"><use href="#gW" class="pg" filter="url(#lgB)"/><use href="#gW" class="pt"/><use href="#gW" class="scan"/><circle cx="33" cy="178" r="2.6" class="nd"/><circle cx="267" cy="178" r="2.6" class="nd"/></g>
</svg>`}

/* map previews, icons */
/** small map preview for cards */
export function mapPreview(cvs: HTMLCanvasElement,m: GameMap){
  const g=cvs.getContext('2d')!,sc=cvs.width/COLS,th=THEMES[m.th||'net'];paintMap(g,m,sc);drawDeco(g,m,0);
  g.lineCap='round';g.lineJoin='round';
  for(const rt of m.routes){g.beginPath();rt.air.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.setLineDash([.12,.3]);g.strokeStyle='rgba(77,255,210,.4)';g.lineWidth=.06;g.stroke();g.setLineDash([])}
  for(const rt of m.routes){g.beginPath();rt.path.forEach((p,i)=>i?g.lineTo(p.x,p.y):g.moveTo(p.x,p.y));g.strokeStyle=`rgba(${th.edge},.16)`;g.lineWidth=.55;g.stroke();g.strokeStyle=`rgba(${th.hi},.85)`;g.lineWidth=.07;g.stroke()}
  g.globalCompositeOperation='lighter';for(const a of m.gates)glow(g,a.x,a.y,1.1,th.gate,.6);for(const c of m.cores)glow(g,c.x,c.y,1.3,'#ff2e6a',.8);g.globalCompositeOperation='source-over';
  for(const c of m.cores){g.save();g.translate(c.x,c.y);g.strokeStyle='#ff4d8a';g.lineWidth=.08;poly(g,6,.36,0);g.stroke();poly(g,6,.2,.5);g.stroke();g.restore()}
  if(m.fork!=null)drawSwitch(g,m,0,0);
}
export function enemyIcon(cvs: HTMLCanvasElement,type: EnemyType){const g=cvs.getContext('2d')!,s=cvs.width,d=ED[type];g.setTransform(1,0,0,1,0,0);g.clearRect(0,0,s,s);const sc=s*.3/d.r;g.setTransform(sc,0,0,sc,s/2,s/2);
  drawEnemy({t:type,d,x:0,y:0,air:false,icon:true,ang:-Math.PI/4,hp:1,max:1,sh:0,msh:0,slowT:0,frz:0,stun:0,regen:0,cloak:false,vis:true,hitT:0,wob:0,cd:null,phase:0},g,.6)}
/** stats of a tower level without any bonuses, for the codex */
export function baseStats(type: TowerType,lvl: number){const s={} as Stats;for(let i=0;i<lvl;i++)Object.assign(s,TD[type].lv[i]);return s}
/** label/value rows for the codex stat table */
export function statRows(type: TowerType,s: Stats){const R: [string, string|number][]=[];
  if(type==='laser')R.push(['Урон в секунду',s.dps]);
  if(type==='cannon')R.push(['Урон',s.dmg],['Радиус взрыва',r1(s.splash)]);
  if(type==='cryo')R.push(['Замедление',Math.round(s.slow*100)+'%'],['Урон',s.dmg]);
  if(type==='tesla')R.push(['Урон',s.dmg],['Целей в цепи',s.chains]);
  if(type==='sniper')R.push(['Урон',s.dmg],['Шанс крита',Math.round(s.crit*100)+'%']);
  if(type==='gravi')R.push(['Замедление',Math.round(s.pull*100)+'%'],['Радиус воронки',r1(s.wr)],['Удержание, с',r1(s.dur)]);
  if(type==='gen'){R.push(['Доход за волну','+'+s.inc],['Усиление соседей','+'+Math.round(s.aura*100)+'%']);return R}
  R.push(['Дальность',r1(s.range)]);if(s.rate)R.push(['Перезарядка, с',r1(s.rate)]);
  return R}
/** codex: enemy description and where it first appears */
export const EINFO: Partial<Record<EnemyType, [string, string|number]>>={drone:['Основа волн, без особенностей.',1],scout:['Быстрый и хрупкий, приходит большими группами.',2],tank:['Медленный, с бронёй 6. Каждая единица брони снижает урон на 4%.',4],wasp:['Летает и срезает углы маршрута. Пушка его не достаёт.',5],guard:['Носит щит, который восстанавливается, если по нему не стрелять 2 секунды.',7],
 medic:['Раз в пару секунд лечит врагов вокруг себя. Уничтожайте его первым: коснитесь, чтобы сфокусировать огонь.',8],split:['При гибели распадается на два быстрых Осколка.',9],blink:['Время от времени перескакивает вперёд по маршруту.',11],jammer:['Импульсом отключает башни рядом с собой на пару секунд.',13],carrier:['Бронированный транспорт. При гибели выпускает трёх летающих Мошек.',15],
 boss:['Босс. Броня и щит, на половине здоровья вызывает трёх Стражей, на четверти ускоряется. Прорыв стоит 5 прочности ядра.','волны 10, 40, 70'],
 queen:['Босс. Рожает ос на ходу, а на половине здоровья выпускает весь рой разом.','волны 20, 50, 80'],
 wrecker:['Босс. Обстреливает башни рядом с путём и выводит их из строя на 6 секунд. Дальние башни в безопасности.','волны 30, 60, 90']};
