// Generates docs/spec.md: the game's data tables (towers, enemies, missions, lab, perks, season, shop...)
// read straight from game/neon-td.html, so the reference never drifts from the code.
// Usage: node tools/spec.js [game.html] > docs/spec.md
const fs=require('fs'),vm=require('vm'),path=require('path');
const file=process.argv[2]||path.join(__dirname,'..','game','neon-td.html');
function mk(){const store={};return new Proxy(function(){},{get(_,k){if(k===Symbol.toPrimitive)return()=>0;if(k==='then')return undefined;if(k in store)return store[k];return store[k]=mk()},
  set(_,k,v){store[k]=v;return true},apply(){return mk()},construct(){return mk()}})}
let js=fs.readFileSync(file,'utf8').match(/<script>([\s\S]*?)<\/script>/)[1];
const EXPORT='TD,ED,MODS,MISSIONS,CHAPTERS,MAPS,LAB_BR,ACH,PERKS,NM,TW_UNLOCK,SKINS,KFX,SEASONS,SHOP,LEAGUES,QD,QW,MAST,RANKS,SYN,AB,VET,BOSSES,'+
  'S_TIER,S_MAX,S_EARLY,S_EARLY_COST,S_OLD,XP_WAVE,XP_DAILY,Q_XP,QW_XP,QW_REW,BOSS_LAP,BOSS_LAP_HEAL,CLOAK_NEAR,tierStart,tierRew,starConds,goalLong';
if(!js.includes('window.__td={'))throw new Error('export hook not found: window.__td={');
js=js.replace('window.__td={',`window.__spec={${EXPORT}};window.__td={`);
const ls=new Map(),ctx={document:mk(),performance:{now:()=>0},requestAnimationFrame:()=>0,ResizeObserver:class{observe(){}},devicePixelRatio:1,addEventListener(){},
  setTimeout:()=>0,clearTimeout(){},console,Date,localStorage:{getItem:k=>ls.has(k)?ls.get(k):null,setItem:(k,v)=>ls.set(k,String(v)),removeItem:k=>ls.delete(k)}};
ctx.window=ctx;vm.createContext(ctx);vm.runInContext(js,ctx);const S=ctx.__spec;
const L=[],w=s=>L.push(s),esc=s=>String(s).replace(/\|/g,'\\|');
const table=(head,rows)=>{w('| '+head.join(' | ')+' |');w('|'+head.map(()=>' --- ').join('|')+'|');rows.forEach(r=>w('| '+r.map(esc).join(' | ')+' |'));w('')};
const num=v=>typeof v==='number'?(Number.isInteger(v)?String(v):String(+v.toFixed(3))):JSON.stringify(v);
const stats=o=>Object.entries(o).filter(([k])=>!['cost','name','desc'].includes(k)).map(([k,v])=>`${k} ${typeof v==='object'?JSON.stringify(v):num(v)}`).join(', ');

w('# Справочник механик «Неонового рубежа»');w('');
w('Сгенерировано из `game/neon-td.html` скриптом `node tools/spec.js > docs/spec.md`. Не правьте руками: после изменения кода перегенерируйте.');w('');

w('## Ключевые константы');w('');
table(['Константа','Значение','Смысл'],[
 ['BOSS_LAP',S.BOSS_LAP,'прочности ядра теряется при первом прорыве босса миссии (обычная сложность), босс идёт на второй круг'],
 ['BOSS_LAP_HEAL',S.BOSS_LAP_HEAL,'доля здоровья, которую босс восстанавливает перед вторым кругом'],
 ['CLOAK_NEAR',S.CLOAK_NEAR,'квадрат расстояния (клетки²), на котором любая башня видит невидимку (1,5 клетки)'],
 ['NM',JSON.stringify(S.NM),'«Кошмар»: множители здоровья врагов и стартовых кредитов'],
 ['S_TIER / S_EARLY / S_EARLY_COST',`${S.S_TIER} / ${S.S_EARLY} / ${S.S_EARLY_COST}`,'стоимость ступени сезона; первые S_EARLY ступеней дешевле'],
 ['S_MAX',S.S_MAX,'ступеней в сезоне (сезон 28 дней)'],
 ['S_OLD',S.S_OLD,'старая цена ступени (до версии 12), нужна для переноса опыта'],
 ['XP_WAVE / XP_DAILY',`${S.XP_WAVE} / ${S.XP_DAILY}`,'опыт за отбитую волну / за первую победу в вызове дня'],
 ['Q_XP / QW_XP / QW_REW',`${S.Q_XP} / ${S.QW_XP} / ${S.QW_REW}`,'опыт за задание дня / задание недели, ядер за задание недели'],
 ['MAST',JSON.stringify(S.MAST),'пороги мастерства башен: убийства этой башней, у генератора заработанные кредиты / 8'],
 ['VET',JSON.stringify(S.VET),'пороги ветеранства башни в бою'],
]);
w('Сезонный трек: ступень t начинается с опыта '+[1,5,6,10,20,30].map(t=>`t=${t}: ${S.tierStart(t)}`).join(', ')+'.');w('');

w('## Башни');w('');
w('Обозначения: dps урон в секунду, dmg урон за выстрел, rate перезарядка (с), range дальность (клеток), splash радиус взрыва, slow замедление, chains число целей молнии, crit шанс крита (×3), pierce сквозь броню, shells снарядов в залпе, freeze шанс заморозки, brit хрупкость цели, stun оглушение (с), pull/wr/dur сила, радиус и длительность воронки, drag оттягивание назад, boom взрыв воронки, focus рост урона на цели, beams лучей, inc доход за волну, aura усиление соседей, bank лимит процентов, haste ускорение соседей.');w('');
for(const [k,t] of Object.entries(S.TD)){
  w(`### ${t.name} (\`${k}\`)`);w('');
  w(`${t.desc} Цена ${t.cost}, бьёт по воздуху: ${t.air?'да':'нет'}, доступна с миссии ${(S.TW_UNLOCK[k]||0)+1}.`);w('');
  table(['Уровень / ветка','Цена','Параметры'],[
    ...t.lv.map((l,i)=>[`ур. ${i+1}`,i?l.cost:t.cost,stats(l)]),
    ...Object.entries(t.br||{}).map(([b,x])=>[`${b}: ${x.name}`,x.cost,`${x.desc}. ${stats(x)}`])]);
}
w('### Синергии');w('');
table(['Кто усиливает','Кого','Название','Эффект'],S.SYN.map(s=>[S.TD[s.from]?S.TD[s.from].name:s.from,S.TD[s.to]?S.TD[s.to].name:s.to,s.name,s.desc]));
w('### Способности');w('');
table(['Способность','Перезарядка, с'],Object.values(S.AB).map(a=>[a.name,a.cd]));

w('## Враги');w('');
w('spd в клетках в секунду, rw награда в кредитах, armor броня, shield щит; особые свойства: heal лечение, jam глушение башен, blink прыжки, splits деление, spawns выпуск мелочи при гибели, brood рождение ос, gun обстрел башен.');w('');
table(['Враг','id','Здоровье','Скорость','Награда','Броня','Щит','Особое'],Object.entries(S.ED).map(([k,e])=>[e.name,k,e.hp,e.spd,e.rw,e.armor||'',e.shield||'',
  [e.boss?'босс':'',e.air?'летает':'',...['heal','jam','blink','splits','spawns','brood','gun'].filter(x=>e[x]).map(x=>`${x} ${JSON.stringify(e[x])}`)].filter(Boolean).join('; ')]));
w('### Модификаторы волн');w('');
table(['id','Название','Описание'],Object.entries(S.MODS).map(([k,m])=>[k,m.name,m.long]));

w('## Кампания');w('');
table(['Глава','Название','Описание'],S.CHAPTERS.map((c,i)=>[i+1,c.name,c.sub]));
table(['#','Миссия','Глава','Цель','Волн','Кредиты','HP ×','Кошмар HP ×','Звезда 2','Звезда 3','Особое'],S.MISSIONS.map(M=>{const sc=S.starConds(M);
  return[M.i+1,M.name,M.ch+1,S.goalLong(M,false),M.waves||`поток ${M.flowT} с`,M.gold,M.hp,M.nmh,sc[1]||'',sc[2]||'',
    [M.boss?`босс ${S.ED[M.boss].name}`:'',M.limit?`лимит ${M.limit} башен`:'',M.ban?`запрет: ${S.TD[M.ban]?S.TD[M.ban].name:M.ban}`:'',M.newE?`новый враг: ${S.ED[M.newE].name}`:''].filter(Boolean).join('; ')]}));
w('Карты бесконечного режима и вызовов: '+S.MAPS.map(m=>`${m.name} (${m.diff})`).join(', ')+'.');w('');

w('## Лаборатория (ядра данных)');w('');
for(const b of S.LAB_BR){w(`### ${b.name}`);w('');table(['Узел','id','Эффект','Уровней','Цены'],b.nodes.map(n=>[n.name,n.id,n.desc,n.max,n.cost.join(' / ')]))}
w(`Вся лаборатория стоит ${S.LAB_BR.flatMap(b=>b.nodes).reduce((a,n)=>a+n.cost.reduce((x,y)=>x+y,0),0)} ядер.`);w('');

w('## Перки');w('');
table(['id','Перк','Эффект'],S.PERKS.map(p=>[p.id,p.name,p.desc]));

w('## Сезоны');w('');
w('Награды трека: ступени 10, 20, 30 дают облик, 5, 15, 25 эффект уничтожения, 7, 17, 27 титул, остальные +1 ядро. Сезон длится 28 дней, первый начался 5 октября 2026.');w('');
table(['Сезон','Модификатор недели','Облики','Эффекты','Титулы'],S.SEASONS.map(s=>[s.name,S.MODS[s.mod].name,s.skins.map(x=>S.SKINS[x].name).join(', '),s.fx.map(x=>S.KFX[x].name).join(', '),s.titles.join(', ')]));

w('## Магазин');w('');
w('Награды идущего сезона не продаются. Если купленная вещь потом выпадет на треке, её цена возвращается.');w('');
table(['Вещь','id','Тип','Цена, ядер'],S.SHOP.map(it=>[it.k==='skin'?S.SKINS[it.id].name:S.KFX[it.id].name,it.id,it.k==='skin'?'облик':'эффект',it.cost]));
w('Облики мастерства: '+Object.entries(S.SKINS).filter(([,s])=>s.m).map(([,s])=>`${s.name} (мастерство ${s.m})`).join(', ')+'.');w('');

w('## Задания');w('');
table(['id','Задание дня','Цели'],S.QD.map(q=>[q.id,q.t(q.n[0]),q.n.join(' / ')]));
table(['id','Задание недели','Цель'],S.QW.map(q=>[q.id,q.t(q.n[0]),q.n.join(' / ')]));

w('## Достижения');w('');
table(['id','Название','Условие'],S.ACH.map(a=>[a[0],a[1],a[2]]));

w('## Звания и лиги');w('');
table(['Звание','Ядер всего'],S.RANKS.map(r=>[r[1],r[0]]));
table(['Лига вызова недели','Очков от'],S.LEAGUES.map(l=>[l[0],l[1]]));
process.stdout.write(L.join('\n'));
