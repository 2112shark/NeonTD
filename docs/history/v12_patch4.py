# Priority-1 package: boss second lap, cloak softening, season economy with migration, data-core shop.
import sys
src=sys.argv[1] if len(sys.argv)>1 else 'base.html'
h=open(src).read()
def rep(a,b,n=1):
  global h
  c=h.count(a)
  if c!=n: raise SystemExit(f'expected {n}x, found {c}x: {a[:100]}')
  h=h.replace(a,b)

# ---------- 1. bosses: on normal difficulty the first leak costs 10 core and sends the boss round again ----------
rep("const BOSSES=['boss','queen','wrecker'];","const BOSSES=['boss','queen','wrecker'];\nconst BOSS_LAP=10; // core lost when a mission boss breaks through on normal difficulty; it then walks the route again")
rep("rage:'Колосс в ярости и ускоряется!'}","rage:'Колосс в ярости и ускоряется!',lap:'Колосс прорвался к ядру и пошёл на второй круг! Второго прорыва ядро не выдержит.'}")
rep("rage:'Матка рожает ос всё быстрее!'}","rage:'Матка рожает ос всё быстрее!',lap:'Матка прорвалась и уходит на второй круг! Добейте её, второго прорыва ядро не выдержит.'}")
rep("rage:'Разрушитель ускоряется!'}","rage:'Разрушитель ускоряется!',lap:'Разрушитель прорвался и идёт на второй круг! Второго удара ядро не переживёт.'}")
rep("if(hasP('guard')&&S.guardW!==S.wave){","if(hasP('guard')&&S.guardW!==S.wave&&!(S.mis&&S.mis.boss===e.t)){")
rep("    if(S.mis&&S.mis.boss===e.t){S.bossLeak=1;",
"""    if(S.mis&&S.mis.boss===e.t&&!S.nm&&!S.bossLaps){const bc=e.rt.core||0;
      if((S.coreHp?S.coreHp[bc]:S.lives)>BOSS_LAP){S.bossLaps=1;S.lives-=BOSS_LAP;S.lost+=BOSS_LAP;S.leakGround+=BOSS_LAP;if(S.coreHp)S.coreHp[bc]-=BOSS_LAP;
        S.flash=.6;S.shake=.5;snd('leak');vib(140);text(e.x,cy,'−'+BOSS_LAP+' ядро','#ff4d6d',.38,1.3);say(BL[e.t].lap);
        e.dead=false;e.i=0;e.prog=0;e.x=e.path[0].x;e.y=e.path[0].y;return}}
    if(S.mis&&S.mis.boss===e.t){S.bossLeak=1;""")
rep("vib(140);say('Босс прорвался к ядру. Миссия провалена.');endGame(false);return}","vib(140);say(S.bossLaps?'Босс прорвался второй раз. Миссия провалена.':'Босс прорвался к ядру. Миссия провалена.');endGame(false);return}")
rep("function goalLong(M){switch(M.goal){","function goalLong(M,nm){switch(M.goal){")
rep("case'boss':return`Отбейте ${M.waves} волн и уничтожьте босса: ${ED[M.boss].name}. Если он дойдёт до ядра, миссия провалена.`;",
    "case'boss':return nm?`Отбейте ${M.waves} волн и уничтожьте босса: ${ED[M.boss].name}. Если он дойдёт до ядра, миссия провалена.`:`Отбейте ${M.waves} волн и уничтожьте босса: ${ED[M.boss].name}. Прорвавшись к ядру, он отнимет ${BOSS_LAP} прочности и пойдёт на второй круг; второй прорыв означает поражение.`;")
rep('<span class="goal">${goalLong(M)}</span>','<span class="goal">${goalLong(M,nm)}</span>')
rep("gh=`<p>${goalLong(M)}</p>","gh=`<p>${goalLong(M,S.nm)}</p>")
rep("а стартовых кредитов меньше. Звёзды кошмара считаются отдельно.","а стартовых кредитов меньше.${M.boss?' Прорыв босса здесь сразу означает поражение.':''} Звёзды кошмара считаются отдельно.")

# ---------- 2. cloak: any tower sees an invisible enemy within 1.5 tiles ----------
rep("cloak:{name:'Невидимки',desc:'видны только в зоне Крио и Теслы',long:'Враги невидимы, пока не попадут в зону Крио или Теслы',",
    "cloak:{name:'Невидимки',desc:'видны в зоне Крио и Теслы и вплотную к башням',long:'Враги невидимы, пока не попадут в зону Крио или Теслы или не подойдут к любой башне ближе чем на полторы клетки',")
rep("const MODE_NAMES=","const CLOAK_NEAR=2.25; // squared distance at which any tower sees an invisible enemy\nconst MODE_NAMES=")
rep("for(const e of S.enemies)if(e.cloak)e.vis=rad.some(([t,r2])=>d2(e,t)<=r2)}",
    "for(const e of S.enemies)if(e.cloak)e.vis=rad.some(([t,r2])=>d2(e,t)<=r2)||S.towers.some(t=>d2(e,t)<=CLOAK_NEAR)}")
rep("say('Невидимки! Их видят только Крио и Тесла, остальные башни стреляют лишь по врагам в зоне их действия. Поставьте Крио у пути.')",
    "say('Невидимки! Крио и Тесла видят их во всей зоне действия, остальные башни только вплотную, на полторы клетки. Поставьте Крио у пути.')")

# ---------- 3. season economy: dearer tiers (first five cheap), less XP for waves, more for daily visits ----------
rep("const S_TIER=250,S_MAX=30;",
"""const S_TIER=750,S_MAX=30,S_EARLY=5,S_EARLY_COST=350,S_OLD=250,XP_WAVE=4,XP_DAILY=150;
const tierStart=t=>t<=S_EARLY?t*S_EARLY_COST:S_EARLY*S_EARLY_COST+(t-S_EARLY)*S_TIER;
const tierCost=t=>t<=S_EARLY?S_EARLY_COST:S_TIER;
function tierOf(xp){let t=0;while(t<S_MAX&&xp>=tierStart(t+1))t++;return t}
// a season started under the old flat 250-XP tiers keeps its tier and the progress inside it
function seasonMigrate(s){if(!s||s.e2)return s;const old=Math.min(S_MAX,(s.xp||0)/S_OLD),t=Math.floor(old);
  s.xp=t>=S_MAX?tierStart(S_MAX):Math.round(tierStart(t)+(old-t)*tierCost(t+1));s.e2=1;return s}""")
rep("if(!s||s.id!==si.num){s={id:si.num,xp:0,got:0};PROG.season=s}return s}",
    "if(!s||s.id!==si.num){s={id:si.num,xp:0,got:0,e2:1};PROG.season=s}else seasonMigrate(s);return s}")
rep("const seasonTier=()=>Math.min(S_MAX,Math.floor(seasonState().xp/S_TIER));","const seasonTier=()=>tierOf(seasonState().xp);")
rep("for(let t=before+1;t<=after;t++)grantTier(def,t)}","for(let t=before+1;t<=after;t++)if(t>(s.got||0))grantTier(def,t)}")
rep("PROG.waves++;qev('wave',1);genIncome(1);addXP(10);","PROG.waves++;qev('wave',1);genIncome(1);addXP(XP_WAVE);")
rep("addXP(6*S.wave)","addXP(XP_WAVE*S.wave)")
rep("unlock('daily');addXP(100);","unlock('daily');addXP(XP_DAILY);")
rep("const Q_XP=80,QW_XP=250,QW_REW=2;","const Q_XP=100,QW_XP=400,QW_REW=2;")
rep("f=t>=S_MAX?1:(s.xp-t*S_TIER)/S_TIER;","f=t>=S_MAX?1:(s.xp-tierStart(t))/tierCost(t+1);")
rep("into=s.xp-tier*S_TIER,","into=s.xp-tierStart(tier),")
rep("${into} из ${S_TIER} опыта","${into} из ${tierCost(tier+1)} опыта")
rep("Math.round(into/S_TIER*100)","Math.round(into/tierCost(tier+1)*100)")
rep("o.season=pair(L.season,C.season,(a,b)=>a.id===b.id,(a,b)=>({id:a.id,xp:mx(a.xp,b.xp),got:mx(a.got,b.got)}));",
    "o.season=pair(L.season,C.season,(a,b)=>a.id===b.id,(a,b)=>{const A=seasonMigrate(Object.assign({},a)),B=seasonMigrate(Object.assign({},b));return{id:a.id,xp:mx(A.xp,B.xp),got:mx(A.got,B.got),e2:1}});")

# ---------- 4. shop: data cores buy cosmetics once the lab is done ----------
rep("season:null,weekly:null,ts:0});","season:null,weekly:null,buy:{},refund:{},ts:0});")
rep("for(const k of['ms','st','seenE','stars','ach','lab','best','own','skin'])","for(const k of['ms','st','seenE','stars','ach','lab','best','own','skin','buy','refund'])")
rep("const ptsFree=()=>ptsTotal()-ptsSpent();","const sumV=o=>Object.values(o||{}).reduce((a,b)=>a+(+b||0),0);\nconst shopSpent=()=>Math.max(0,sumV(PROG.buy)-sumV(PROG.refund));\nconst ptsFree=()=>ptsTotal()-ptsSpent()-shopSpent();")
rep("o.own=Object.assign({},C.own||{},L.own||{});","o.own=Object.assign({},C.own||{},L.own||{});o.buy=Object.assign({},C.buy||{},L.buy||{});o.refund=Object.assign({},C.refund||{},L.refund||{});")
rep(" eclipse:{name:'Затмение',c:'#ff3d5c',sc:'#ffd23d'},",
    " eclipse:{name:'Затмение',c:'#ff3d5c',sc:'#ffd23d'},\n plasma:{name:'Плазма',c:'#ff3df2',sc:'#fff0fd'},\n royal:{name:'Корона',c:'#a98bff',sc:'#ffd84d'},")
rep("/* ---------- weekly challenge and leagues ---------- */",
"""/* ---------- shop: data cores for cosmetics ---------- */
const SHOP=[['volt','skin',30],['ember','skin',30],['neon','skin',30],['frost','skin',30],['aurora','skin',30],['void','skin',30],['toxic','skin',30],['rose','skin',30],['eclipse','skin',30],['plasma','skin',60],['royal','skin',60],
 ['spark','fx',15],['pixel','fx',15],['nova','fx',15],['confetti','fx',15],['ice','fx',15],['glitch','fx',15]].map(([id,k,cost])=>({id,k,cost}));
const shopKey=it=>it.k==='fx'?'fx:'+it.id:it.id;
const shopOwned=it=>!!(PROG.own&&PROG.own[shopKey(it)]);
// rewards of the running season stay on its track; the shop sells them once the season is over
function shopSeasonTier(it){const def=seasonInfo().def,i=(it.k==='skin'?def.skins:def.fx).indexOf(it.id);return i<0?0:it.k==='skin'?(i+1)*10:i*10+5}
function shopBuy(id){const it=SHOP.find(x=>x.id===id);if(!it||shopOwned(it)||shopSeasonTier(it)||ptsFree()<it.cost)return false;
  PROG.buy=PROG.buy||{};PROG.buy[shopKey(it)]=it.cost;(PROG.own||(PROG.own={}))[shopKey(it)]=1;saveProg();return true}

/* ---------- weekly challenge and leagues ---------- */""")
old_lab=h[h.index("SCR.lab=()=>{"):h.index("function questLi(")]
new_lab="""function shopHtml(free){const si=seasonInfo();
  const row=it=>{const own=shopOwned(it),st=shopSeasonTier(it),z=it.k==='skin'?SKINS[it.id]:KFX[it.id];
    const pv=it.k==='skin'?`<canvas width="88" height="88" data-tower="laser" data-skin="${it.id}"></canvas>`:`<span class="fxi">${PIC.burst}</span>`;
    const right=own?'<span class="done">Есть</span>':st?`<span class="sea">Награда сезона<br>ступень ${st}</span>`:`<button class="buy" data-act="buy:${it.id}"${free<it.cost?' disabled':''}>Купить<em>${IC.core}${it.cost}</em></button>`;
    return`<li>${pv}<div><b>${z.name}</b><p>${it.k==='skin'?'Облик для любой башни':'Эффект уничтожения'}${it.cost>=60?'. Только в магазине':''}</p></div>${right}</li>`};
  return`<p class="lead">Ядра, оставшиеся после улучшений, можно обменять на облики и эффекты. Награды сезона «${si.def.name}» появятся здесь, когда он закончится.</p>
  <h3 class="sec">Облики башен</h3><ul class="nodes shop" style="--bc:var(--pink)">${SHOP.filter(it=>it.k==='skin').map(row).join('')}</ul>
  <h3 class="sec">Эффекты уничтожения</h3><ul class="nodes shop" style="--bc:var(--pink)">${SHOP.filter(it=>it.k==='fx').map(row).join('')}</ul>
  <p class="lead">Облики надеваются в Арсенале, эффект уничтожения выбирается в профиле. Если купленная вещь потом выпадет на сезонном треке, ядра за неё вернутся.</p>`}
SCR.lab=()=>{const tab=LBY.labTab>2?0:LBY.labTab,free=ptsFree();
  const tabs=`<div class="segs" role="tablist" aria-label="Раздел">${[['Улучшения','var(--accent)'],['Арсенал','#ffd84d'],['Магазин','var(--pink)']].map(([n,c],i)=>`<button role="tab" aria-selected="${i===tab}" class="${i===tab?'on':''}" style="--sc:${c}" data-act="labtab:${i}">${n}</button>`).join('')}</div>`;
  if(tab===1)return`<div class="lb-in">${head('Лаборатория')}
  <p class="lead">Арсенал: мастерство башен и их облики. Бонус мастерства действует в кампании и бесконечном режиме.</p>${tabs}${arsenalHtml()}</div>`;
  if(tab===2)return`<div class="lb-in">${head('Лаборатория')}${tabs}${shopHtml(free)}</div>`;
  return`<div class="lb-in">${head('Лаборатория')}
  <p class="lead">Ядра данных открывают постоянные улучшения для кампании и бесконечного режима. В вызовах они не действуют.</p>${tabs}
  ${LAB_BR.map(br=>`<h3 class="sec" style="color:${br.col}">${br.name}</h3><ul class="nodes" style="--bc:${br.col}">${br.nodes.map(n=>{const lv=labRaw(n.id),full=lv>=n.max,cost=full?0:n.cost[lv];
    return`<li><div><b>${n.name}</b><p>${n.desc}</p><span class="pips" role="img" aria-label="Уровень ${lv} из ${n.max}">${Array.from({length:n.max},(_,k)=>`<i class="${k<lv?'on':''}"></i>`).join('')}</span></div>${full?'<span class="done">Изучено</span>':`<button class="buy" data-act="learn:${n.id}"${free<cost?' disabled':''}>Изучить<em>${IC.core}${cost}</em></button>`}</li>`}).join('')}</ul>`).join('')}
  <p class="lead">Ядра дают звёзды миссий, достижения, задания, сезонный трек, победы в вызове дня и каждые 10 отбитых волн. Сброс возвращает ядра, потраченные на улучшения; покупки в магазине остаются.</p>
  <button class="textbtn danger" data-act="labreset">${LBY.arm==='labreset'?'Коснитесь ещё раз, чтобы сбросить':'Сбросить улучшения'}</button>
  </div>`};
"""
assert old_lab.count("SCR.lab=()=>{")==1
h=h.replace(old_lab,new_lab+old_lab[old_lab.index("function arsenalHtml") if "function arsenalHtml" in old_lab else len(old_lab):] if False else new_lab,1)
rep("case'labtab':LBY.labTab=+v;snd('tap');go('lab',true);break;",
    "case'labtab':LBY.labTab=+v;snd('tap');go('lab',true);break;\n    case'buy':if(shopBuy(v)){snd('up');vib(15);go('lab',true)}break;")
h=h.replace("</style>",""".nodes.shop li{grid-template-columns:44px minmax(0,1fr) auto}
.shop canvas{width:44px;height:44px}
.fxi{display:grid;place-items:center;width:44px;height:44px;color:var(--pink)}
.fxi svg{width:26px;height:26px}
.sea{font-size:12px;line-height:1.35;color:var(--dim);text-align:right;white-space:nowrap}
h3.sec+.nodes{margin-top:-4px}
</style>""",1)
rep("ctx.fillText(boss.d.name.toUpperCase()+(boss.phase?` · фаза ${boss.phase+1}`:''),bx,by+3);",
    "ctx.fillText(boss.d.name.toUpperCase()+(boss.phase?` · фаза ${boss.phase+1}`:'')+(S.bossLaps&&S.mis&&S.mis.boss===boss.t?' · 2-й круг':''),bx,by+3);")
rep("function grantTier(def,t){const r=tierRew(def,t),own=PROG.own||(PROG.own={});\n  if(r.k==='core')PROG.bonus=(PROG.bonus||0)+1;\n  else if(r.k==='skin'){if(own[r.id])PROG.bonus=(PROG.bonus||0)+2;own[r.id]=1}\n  else if(r.k==='fx'){if(own['fx:'+r.id])PROG.bonus=(PROG.bonus||0)+1;own['fx:'+r.id]=1}",
    "// a season reward the player already bought in the shop returns its price; any other duplicate gives a little data\nfunction dupRew(key,n){const p=(PROG.buy||{})[key],rf=PROG.refund||(PROG.refund={});\n  if(p&&!rf[key]){rf[key]=p;return`. Ядра за покупку возвращены: +${p}`}PROG.bonus=(PROG.bonus||0)+n;return''}\nfunction grantTier(def,t){const r=tierRew(def,t),own=PROG.own||(PROG.own={});let note='';\n  if(r.k==='core')PROG.bonus=(PROG.bonus||0)+1;\n  else if(r.k==='skin'){if(own[r.id])note=dupRew(r.id,2);own[r.id]=1}\n  else if(r.k==='fx'){if(own['fx:'+r.id])note=dupRew('fx:'+r.id,1);own['fx:'+r.id]=1}")
rep("if(S&&!lobbyOn()&&!S.over)toast(`Сезон: ступень ${t}. ${rewName(r)}`)}","if(S&&!lobbyOn()&&!S.over)toast(`Сезон: ступень ${t}. ${rewName(r)}${note}`)}")
rep('<p class="ver">Неоновый рубеж, версия 7</p>','<p class="ver">Неоновый рубеж, версия 8</p>')
# the lab dot also lights up once research is complete and new cores can buy something in the shop
rep("mark('lab',LAB.some(n=>{const lv=labRaw(n.id);return lv<n.max&&n.cost[lv]<=free}));",
    "mark('lab',LAB.some(n=>{const lv=labRaw(n.id);return lv<n.max&&n.cost[lv]<=free})||(LAB.every(n=>labRaw(n.id)>=n.max)&&free>(PROG.shopSeen||0)&&SHOP.some(it=>!shopOwned(it)&&!shopSeasonTier(it)&&it.cost<=free)));")
rep("case'labtab':LBY.labTab=+v;snd('tap');go('lab',true);break;\n    case'buy':if(shopBuy(v)){snd('up');vib(15);go('lab',true)}break;",
    "case'labtab':LBY.labTab=+v;if(+v===2){PROG.shopSeen=ptsFree();saveProg()}snd('tap');go('lab',true);break;\n    case'buy':if(shopBuy(v)){PROG.shopSeen=ptsFree();saveProg();snd('up');vib(15);go('lab',true)}break;")
rep("<p class=\"lead\">Опыт дают отбитые волны, победы в миссиях и вызовах, задания дня и недели. Награды выдаются сразу.</p>",
    "<p class=\"lead\">Больше всего опыта дают задания дня и недели и первая за день победа в вызове дня, понемногу добавляют миссии и отбитые волны. Награды выдаются сразу.</p>")
rep("SYN,LAB,get PROG(){return PROG}","SYN,LAB,LAB_BR,grantTier,dupRew,tierStart,tierCost,tierOf,seasonMigrate,SHOP,shopBuy,shopSeasonTier,ptsFree,ptsTotal,shopSpent,BOSS_LAP,CLOAK_NEAR,get PROG(){return PROG}")
open(sys.argv[2] if len(sys.argv)>2 else 'out.html','w').write(h)
print('ok',len(h))
